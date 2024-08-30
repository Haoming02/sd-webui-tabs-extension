class TabsExtension {

    static #config;

    static #active_tab = {
        "txt": undefined,
        "img": undefined
    };

    static #enable_pairs = {
        "txt": [],
        "img": []
    };

    /**
     * @param {Element} extension
     * @returns {Element}
     */
    static #tryFindEnableToggle(extension) {
        const checkboxs = Array.from(extension.querySelectorAll('input[type=checkbox]'));
        if (checkboxs.length === 0)
            return null;

        const labels = checkboxs.map(checkbox =>
            checkbox.parentNode.querySelector('span')?.textContent.toLowerCase());

        // Try to find "enable" first
        for (let i = 0; i < labels.length; i++) {
            if (labels[i]?.includes('enable'))
                return checkboxs[i];
        }

        // Then to find "active" second
        for (let i = 0; i < labels.length; i++) {
            if (labels[i]?.includes('active'))
                return checkboxs[i];
        }

        // Null otherwise
        return null;
    }

    /** @param {string} mode 'txt' | 'img' */
    static #verifyTabsEnable(mode) {
        setTimeout(() => {

            for (const [toggle, button] of this.#enable_pairs[mode]) {
                if (toggle.checked)
                    button.classList.add('active');
                else
                    button.classList.remove('active');
            }

        }, 25 * this.#config.delay);
    }

    /**
     * @param {object} extensions
     * @param {object} configs
     * @returns {object}
     */
    static #sort_extensions(extensions, configs) {
        if (!this.#config.sort)
            return extensions;

        const sorted = {};

        const keys = Array.from(Object.keys(configs));
        keys.forEach((key) => {
            if (extensions.hasOwnProperty(key)) {
                sorted[key] = extensions[key];
                delete extensions[key];
            }
        });

        Object.keys(extensions).forEach((key) => {
            sorted[key] = extensions[key];
        });

        return sorted;
    }

    /**
     * le Main Logics
     * @param {string} mode 'txt' | 'img'
     * @param {{string: Element}} extensions
     * @param {{string: string}} configs
     */
    static #setup_tabs(mode, extensions, configs) {

        const container = {
            'left': document.getElementById(`${mode}2img_script_container`),
            'right': document.getElementById(`${mode}2img_results`)
        };

        const mainSide = configs['tabs'];
        const oppSide = (mainSide === "left") ? 'right' : 'left'

        /** `<div>` to host the contents */
        const contentContainers = {};

        ['above', 'left', 'below', 'right'].forEach(side => {
            contentContainers[side] = document.createElement("div");
            contentContainers[side].id = `tabs_ex_content-${mode}2img-${side}`;
            contentContainers[side].style.overflow = "visible";
        });

        container[mainSide].appendChild(contentContainers['above']);
        container[mainSide].appendChild(contentContainers[mainSide]);
        container[mainSide].appendChild(contentContainers['below']);
        container[oppSide].appendChild(contentContainers[oppSide]);

        /** `<div>` to host the buttons */
        const tabsContainer = document.createElement("div");
        tabsContainer.id = `tabs_ex_${mode}`;

        contentContainers[configs['tabs']].appendChild(tabsContainer);

        const allButtons = {};

        Object.keys(extensions).forEach(tabKey => {
            // New Extension
            if (!configs.hasOwnProperty(tabKey))
                configs[tabKey] = configs['default'];

            else {
                const pos = configs[tabKey];
                if (pos === "above" || pos === "below") {
                    contentContainers[pos].appendChild(extensions[tabKey]);
                    extensions[tabKey].style.display = "block";
                    return;
                }
            }

            const btnSpan = document.createElement('span');
            btnSpan.className = 'tab_label';

            const extensionName = (!this.#config.version) ?
                extensions[tabKey].getAttribute("ext-label") : tabKey;

            btnSpan.textContent = (!this.#config.forge) ? extensionName :
                extensionName.split('Integrated')[0].trim();

            const tabButton = document.createElement("button");
            tabButton.classList.add('tab_button');
            tabButton.appendChild(btnSpan);

            tabsContainer.appendChild(tabButton);
            allButtons[tabKey] = tabButton;

            tabButton.addEventListener("click", (e) => {
                if (e.ctrlKey)
                    return;

                if (this.#active_tab[mode] != undefined) {
                    allButtons[this.#active_tab[mode]].classList.remove('selected');
                    extensions[this.#active_tab[mode]].style.display = "none";
                }

                this.#active_tab[mode] = (
                    (this.#config.toggle) && (this.#active_tab[mode] === tabKey)
                ) ? undefined : tabKey;

                if (this.#active_tab[mode] != undefined) {
                    allButtons[this.#active_tab[mode]].classList.add('selected');
                    extensions[this.#active_tab[mode]].style.display = "block";
                }
            });

            contentContainers[configs[tabKey]].appendChild(extensions[tabKey]);

            if (tabKey === 'Scripts')
                return;

            const enableToggle = this.#tryFindEnableToggle(extensions[tabKey]);
            if (enableToggle == null)
                return;

            // Change Color if Enabled
            enableToggle.addEventListener("change", () => {
                if (enableToggle.checked)
                    allButtons[tabKey].classList.add('active');
                else
                    allButtons[tabKey].classList.remove('active');
            });

            this.#enable_pairs[mode].push([enableToggle, allButtons[tabKey]]);

            // Ctrl + Click = Toggle
            allButtons[tabKey].addEventListener("click", (e) => {
                if (e.ctrlKey)
                    enableToggle.click();
            });

            // Check if already Enabled on start up
            if (enableToggle.checked)
                allButtons[tabKey].classList.add('active');

        });

        // Hide empty containers
        ['above', 'left', 'below', 'right'].forEach(side => {
            if (contentContainers[side].children.length === 0)
                contentContainers[side].style.display = "none";
        });

        // Select the first option at the start
        if (this.#config.open)
            Object.values(allButtons)[0].click();

        // Check for active Script
        const scriptsDropdown = extensions['Scripts'].querySelector('input');

        const options = { root: document.documentElement };
        const observer = new IntersectionObserver((entries, observer) => {
            if (entries[0].intersectionRatio > 0) {
                this.#verifyTabsEnable(mode);

                if (scriptsDropdown.value === 'None')
                    allButtons['Scripts']?.classList.remove('active');
                else
                    allButtons['Scripts']?.classList.add('active');
            }
        }, options);

        // When switching tabs, refresh the active status
        observer.observe(tabsContainer);

        return configs;
    }

    static init() {
        var configs = undefined;

        try {
            this.#config = new TabsExtensionConfigs();
            configs = this.#config.parseConfigs();
        } catch (e) {
            alert(`[TabsExtension] Something went wrong while parsing configs:\n${e}`);
            return;
        }

        const processed_configs = {};
        setTimeout(() => {

            ['txt', 'img'].forEach((mode) => {
                var extensions = undefined;

                try {
                    const parsed = TabsExtensionParser.parse(mode);
                    extensions = this.#sort_extensions(parsed, configs[mode]);
                } catch (e) {
                    alert(`[TabsExtension] Something went wrong while parsing ${mode} extensions:\n${e}`);
                    return;
                }

                if (this.#config.container)
                    document.getElementById(`${mode}2img_script_container`).querySelector(".styler").style.display = "none";

                try { processed_configs[mode] = this.#setup_tabs(mode, extensions, configs[mode]); }
                catch (e) {
                    alert(`[TabsExtension] Something went wrong during ${mode} setup:\n${e}`);
                    return;
                }
            });

            setTimeout(() => {
                try { this.#config.saveConfigs(processed_configs); }
                catch (e) {
                    alert(`[TabsExtension] Something went wrong while saving configs:\n${e}`);
                    return;
                }
            }, this.#config.delay);

        }, this.#config.delay);
    }
}

onUiLoaded(() => {
    setTimeout(() => { TabsExtension.init(); }, 100);
});
