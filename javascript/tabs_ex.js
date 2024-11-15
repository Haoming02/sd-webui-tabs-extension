class TabsExtension {

    /** @type {TabsExtensionConfigs} */
    static #config;

    /** @type {{string: HTMLDivElement}} */
    static #activeExtension = {
        "txt": undefined,
        "img": undefined
    };

    /** @type {{string: [HTMLInputElement, HTMLButtonElement][]}} */
    static #enablePairs = {
        "txt": [],
        "img": []
    };

    /** @param {HTMLDivElement} extension @returns {HTMLInputElement} */
    static #tryFindEnableToggle(extension) {
        const allCheckbox = Array.from(extension.querySelectorAll('input[type=checkbox]'));
        if (allCheckbox.length === 0)
            return null;

        let temp = null;
        const labels = allCheckbox.map((checkbox) =>
            checkbox.parentNode.querySelector('span')?.textContent.toLowerCase());

        // Find the first "enable" label; otherwise use the first "active" label
        for (let i = 0; i < labels.length; i++) {
            if (labels[i]?.includes('enable'))
                return allCheckbox[i];
            if ((temp == null) && (labels[i]?.includes('active')))
                temp = allCheckbox[i];
        }

        // null by default
        return temp;
    }

    static refreshEnableCheckbox() {
        setTimeout(() => {
            ['txt', 'img'].forEach((mode) => {
                for (const [toggle, button] of this.#enablePairs[mode]) {
                    if (toggle.checked)
                        button.classList.add('active');
                    else
                        button.classList.remove('active');
                }
            });
        }, this.#config.delay);
    }

    /**
     * @param {{string: HTMLDivElement}} extensions
     * @param {{string: string}} configs
     * @returns {{string: HTMLDivElement}}
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
     * 'le Main Logics
     * @param {string} mode 'txt' | 'img'
     * @param {{string: HTMLDivElement}} extensions
     * @param {{string: {string: HTMLDivElement}}} configs
     * @returns {{string: string}}
     */
    static #setup_tabs(mode, extensions, configs) {
        const container = {
            'left': document.getElementById(`${mode}2img_script_container`),
            'right': document.getElementById(`${mode}2img_results`)
        };

        const mainSide = configs['tabs'];
        const oppSide = (mainSide === 'left') ? 'right' : 'left'

        const extensionContainers = {};

        ['above', 'left', 'below', 'right'].forEach((side) => {
            extensionContainers[side] = document.createElement("div");
            extensionContainers[side].id = `tabs_ex_content-${mode}2img-${side}`;
            extensionContainers[side].style.overflow = "visible";
        });

        const buttonContainer = document.createElement("div");
        extensionContainers[mainSide].appendChild(buttonContainer);
        buttonContainer.id = `tabs_ex_${mode}`;

        container[mainSide].appendChild(extensionContainers['above']);
        container[mainSide].appendChild(extensionContainers[mainSide]);
        container[mainSide].appendChild(extensionContainers['below']);
        container[oppSide].appendChild(extensionContainers[oppSide]);

        const allButtons = {};

        Object.keys(extensions).forEach((tabKey) => {
            if (!configs.hasOwnProperty(tabKey)) {
                // New Extension
                configs[tabKey] = configs['default'];
            }

            const pos = configs[tabKey];
            if (pos === "hide")
                return;
            else if (pos === "above" || pos === "below") {
                extensionContainers[pos].appendChild(extensions[tabKey]);
                extensions[tabKey].style.display = "block";
                return;
            }

            const btnSpan = document.createElement('span');
            btnSpan.className = 'tab_label';

            const extensionName = this.#config.version ? tabKey :
                extensions[tabKey].getAttribute("ext-label");

            btnSpan.textContent = (!this.#config.forge) ? extensionName :
                extensionName.split('Integrated')[0].trim();

            const tabButton = document.createElement("button");
            tabButton.classList.add('tab_button');
            tabButton.appendChild(btnSpan);

            buttonContainer.appendChild(tabButton);
            allButtons[tabKey] = tabButton;

            tabButton.addEventListener("click", (e) => {
                if (e.ctrlKey)
                    return;

                if (this.#activeExtension[mode] != undefined) {
                    allButtons[this.#activeExtension[mode]].classList.remove('selected');
                    extensions[this.#activeExtension[mode]].style.display = "none";
                }

                this.#activeExtension[mode] = (
                    (this.#config.toggle) && (this.#activeExtension[mode] === tabKey)
                ) ? undefined : tabKey;

                if (this.#activeExtension[mode] != undefined) {
                    allButtons[this.#activeExtension[mode]].classList.add('selected');
                    extensions[this.#activeExtension[mode]].style.display = "block";
                }
            });

            extensionContainers[configs[tabKey]].appendChild(extensions[tabKey]);

            if (tabKey === 'Scripts') {
                const scriptsDropdown = extensions[tabKey].querySelector('input');

                const observer = new MutationObserver((mutations) => {
                    if (mutations) {
                        if (scriptsDropdown.value != 'None')
                            allButtons['Scripts'].classList.add('active');
                        else
                            allButtons['Scripts'].classList.remove('active');
                    }
                });

                observer.observe(extensions[tabKey], { childList: true, subtree: true });
                return;
            }

            const enableToggle = this.#tryFindEnableToggle(extensions[tabKey]);
            if (enableToggle == null)
                return;

            // Ctrl + Click = Toggle
            allButtons[tabKey].addEventListener("click", (e) => {
                if (e.ctrlKey)
                    enableToggle.click();
            });

            // Check if already Enabled on Start
            if (enableToggle.checked)
                allButtons[tabKey].classList.add('active');

            // Link the Elements to Change Color if Enabled
            this.#enablePairs[mode].push([enableToggle, allButtons[tabKey]]);
        });

        // Hide Empty Containers
        ['above', 'left', 'below', 'right'].forEach((side) => {
            if (extensionContainers[side].children.length === 0)
                extensionContainers[side].remove();
        });

        // Open the first Extension at the start
        if (this.#config.open)
            Object.values(allButtons)[0].click();

        return configs;
    }

    static init() {
        this.#config = new TabsExtensionConfigs();
        const configs = this.#config.parseConfigs();
        const processed_configs = {};

        setTimeout(() => {

            ['txt', 'img'].forEach((mode) => {
                let extensions = undefined;

                try {
                    const parsed = TabsExtensionParser.parse(mode);
                    extensions = this.#sort_extensions(parsed, configs[mode]);
                } catch (e) {
                    alert(`[TabsExtension] Something went wrong while parsing ${mode}2img extensions:\n${e}`);
                    return;
                }

                if (this.#config.container)
                    document.getElementById(`${mode}2img_script_container`).querySelector(".styler").style.display = "none";

                try { processed_configs[mode] = this.#setup_tabs(mode, extensions, configs[mode]); }
                catch (e) {
                    alert(`[TabsExtension] Something went wrong during ${mode}2img setup:\n${e}`);
                    return;
                }
            });

            try { this.#config.saveConfigs(processed_configs); }
            catch (e) {
                alert(`[TabsExtension] Something went wrong while saving configs:\n${e}`);
                return;
            }

        }, this.#config.delay);
    }
}

(function () {
    onUiLoaded(() => setTimeout(() => { TabsExtension.init(); }, 250));
})();
