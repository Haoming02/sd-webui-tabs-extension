class TabsExtension {

    /** @type {TabsExtensionConfigs} */
    static #config;

    /** @type {{string: HTMLDivElement}} */
    static #activeExtension = { "txt": null, "img": null };

    /** @type {[HTMLInputElement, HTMLButtonElement][]} */
    static #enablePairs = [];

    /** @type {setTimeout} */
    static #refreshQueue = null;

    /** @param {HTMLDivElement} extension @returns {HTMLInputElement} */
    static #tryFindEnableToggle(extension) {
        let temp = null;

        for (const checkbox of extension.querySelectorAll('input[type=checkbox]')) {
            const labelText = checkbox.parentNode?.querySelector('span')?.textContent?.toLowerCase();
            // Find the first "enable" label; otherwise use the first "active" label
            if (labelText?.includes('enable')) return checkbox;
            if (!temp && labelText?.includes('active')) temp = checkbox;
        }

        // null by default
        return temp;
    }

    static #refreshEnableCheckbox() {
        if (this.#refreshQueue) clearTimeout(this.#refreshQueue);
        this.#refreshQueue = setTimeout(() => {
            for (const [toggle, button] of this.#enablePairs) {
                if (toggle.checked)
                    button.classList.add('active');
                else
                    button.classList.remove('active');
            }
        }, 250);
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
        for (const key of keys) {
            if (extensions.hasOwnProperty(key)) {
                sorted[key] = extensions[key];
                delete extensions[key];
            }
        }

        for (const key of Object.keys(extensions))
            sorted[key] = extensions[key];

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

        /** @type {string} */ const mainSide = configs['tabs'];
        /** @type {string} */ const oppSide = (mainSide === 'left') ? 'right' : 'left'

        const extensionContainers = {};

        for (const side of ['above', 'left', 'below', 'right']) {
            extensionContainers[side] = document.createElement("div");
            extensionContainers[side].id = `tabs_ex_content-${mode}2img-${side}`;
            extensionContainers[side].style.overflow = "visible";
        }

        const buttonContainer = document.createElement("div");
        extensionContainers[mainSide].appendChild(buttonContainer);
        buttonContainer.id = `tabs_ex_${mode}`;

        container[mainSide].appendChild(extensionContainers['above']);
        container[mainSide].appendChild(extensionContainers[mainSide]);
        container[mainSide].appendChild(extensionContainers['below']);
        container[oppSide].appendChild(extensionContainers[oppSide]);

        const allButtons = {};

        for (const tabKey of Object.keys(extensions)) {
            if (!configs.hasOwnProperty(tabKey)) {
                // New Extension
                configs[tabKey] = configs['default'];
            }

            const pos = configs[tabKey];
            if (pos === "hide")
                continue;

            if (pos === "above" || pos === "below") {
                extensionContainers[pos].appendChild(extensions[tabKey]);
                extensions[tabKey].style.display = "block";
                continue;
            }

            const btnSpan = document.createElement('span');
            btnSpan.className = 'tab_label';

            const extensionName = (this.#config.version) ? tabKey :
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

                if (this.#activeExtension[mode] != null) {
                    allButtons[this.#activeExtension[mode]].classList.remove('selected');
                    extensions[this.#activeExtension[mode]].style.display = "none";
                }

                this.#activeExtension[mode] = (
                    (this.#config.toggle) && (this.#activeExtension[mode] === tabKey)
                ) ? null : tabKey;

                if (this.#activeExtension[mode] != null) {
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
                continue;
            }

            const enableToggle = this.#tryFindEnableToggle(extensions[tabKey]);
            if (enableToggle == null)
                continue;

            // Ctrl + Click = Toggle
            allButtons[tabKey].addEventListener("click", (e) => {
                if (e.ctrlKey)
                    enableToggle.click();
            });

            // Check if already Enabled on Start
            if (enableToggle.checked)
                allButtons[tabKey].classList.add('active');

            // Link the Elements to Change Color if Enabled
            this.#enablePairs.push([enableToggle, allButtons[tabKey]]);
        }

        // Hide Empty Containers
        for (const side of ['above', 'left', 'below', 'right']) {
            if (extensionContainers[side].children.length === 0)
                extensionContainers[side].remove();
        }

        // Open the first Extension at the start
        if (this.#config.open)
            Object.values(allButtons)[0].click();

        return configs;
    }

    static init() {
        this.#config = new TabsExtensionConfigs();
        const configs = this.#config.parseConfigs();
        const processedConfigs = {};

        for (const mode of ['txt', 'img']) {
            let extensions = null;

            const keepExtensions = Object.keys(configs[mode])
                .filter((ext) => configs[mode][ext] === "keep");

            try {
                const parsed = TabsExtensionParser.parse(mode, keepExtensions);
                extensions = this.#sort_extensions(parsed, configs[mode]);
            } catch (e) {
                alert(`[TabsExtension] Something went wrong while parsing ${mode}2img extensions:\n${e}`);
                continue;
            }

            try {
                processedConfigs[mode] = this.#setup_tabs(mode, extensions, configs[mode]);
                if (this.#config.container)
                    document.getElementById(`${mode}2img_script_container`).querySelector(".styler").style.display = "none";
            }
            catch (e) {
                alert(`[TabsExtension] Something went wrong during ${mode}2img setup:\n${e}`);
                continue;
            }
        }

        try { this.#config.saveConfigs(processedConfigs); }
        catch (e) { alert(`[TabsExtension] Something went wrong while saving configs:\n${e}`); }

        document.addEventListener("click", () => this.#refreshEnableCheckbox());
    }
}

(function () {
    onUiLoaded(() => {
        const delay = document.getElementById("setting_tabs_ex_delay").querySelector("input[type=range]").value;
        setTimeout(() => { TabsExtension.init(); }, delay);
    });
})();
