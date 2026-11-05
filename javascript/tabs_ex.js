class TabsExtension {
    /** @type {TabsExtensionConfigs} */
    static #config;

    /** @type {{string: HTMLDivElement}} */
    static #activeExtension = { txt: null, img: null };

    /** @type {[HTMLInputElement, HTMLButtonElement][]} */
    static #enablePairs = [];

    /** @type {number} */
    static #refreshQueue = null;

    /** @param {HTMLDivElement} extension @returns {HTMLInputElement} */
    static #tryFindEnableToggle(extension) {
        let active = null;

        for (const checkbox of extension.querySelectorAll("input[type=checkbox]")) {
            const labelText = checkbox.parentNode?.querySelector("span")?.textContent?.toLowerCase();
            // Find the first "enable" label; otherwise use the first "active" label
            if (labelText?.includes("enable")) return checkbox;
            if (!active && labelText?.includes("active")) active = checkbox;
        }

        return active;
    }

    static #refreshEnableCheckbox() {
        clearTimeout(this.#refreshQueue);
        this.#refreshQueue = setTimeout(() => {
            for (const [toggle, button] of this.#enablePairs) button.classList.toggle("active", toggle.checked);
        }, 250);
    }

    /**
     * @param {{string: HTMLDivElement}} extensions
     * @param {{string: string}} configs
     * @returns {{string: HTMLDivElement}}
     */
    static #sort_extensions(extensions, configs) {
        if (!this.#config.sort) return extensions;

        const sorted = {};

        for (const key of Object.keys(configs)) {
            if (key in extensions) {
                sorted[key] = extensions[key];
                delete extensions[key];
            }
        }

        return Object.assign(sorted, extensions);
    }

    /**
     * Ctrl + Click (or Right Click) = Toggle
     * @param {HTMLButtonElement} button @param {() => void} action
     */
    static #bindToggle(button, action) {
        if (this.#config.rmb) {
            button.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                action();
            });
        } else {
            button.addEventListener("click", (e) => {
                if (e.ctrlKey) action();
            });
        }
    }

    /**
     * 'le Main Logics
     * @param {string} mode 'txt' | 'img'
     * @param {{string: HTMLDivElement}} extensions
     * @param {{string: {string: HTMLDivElement}}} configs
     * @returns {{string: string}}
     */
    static #setup_tabs(mode, extensions, configs) {
    /** @type {string} */ const mainSide = configs["tabs"];
    /** @type {string} */ const oppSide = mainSide === "left" ? "right" : "left";

        const container = {
            left: document.getElementById(`${mode}2img_script_container`),
            right: document.getElementById(`${mode}2img_results`),
        };

        const extensionContainers = {};

        for (const side of ["above", "left", "below", "right"]) {
            extensionContainers[side] = document.createElement("div");
            extensionContainers[side].id = `tabs_ex_content-${mode}2img-${side}`;
            extensionContainers[side].style.overflow = "visible";
        }

        const buttonContainer = document.createElement("div");
        buttonContainer.id = `tabs_ex_${mode}`;
        extensionContainers[mainSide].appendChild(buttonContainer);

        container[mainSide].append(
            extensionContainers["above"],
            extensionContainers[mainSide],
            extensionContainers["below"],
        );
        container[oppSide].append(extensionContainers[oppSide]);

        const allButtons = {};

        for (const tabKey of Object.keys(extensions)) {
            configs[tabKey] ??= configs["default"]; // New Extension

            const pos = configs[tabKey];
            if (pos === "hide") continue;

            if (pos === "above" || pos === "below") {
                extensionContainers[pos].appendChild(extensions[tabKey]);
                extensions[tabKey].style.display = "block";
                continue;
            }

            const extensionName = this.#config.version ? tabKey : extensions[tabKey].getAttribute("ext-label");
            const label = !this.#config.forge ? extensionName : extensionName.split("Integrated")[0].trim();

            const btnSpan = document.createElement("span");
            btnSpan.className = "tab_label";
            btnSpan.textContent = label;

            const tabButton = document.createElement("button");
            tabButton.classList.add("tab_button");
            tabButton.appendChild(btnSpan);

            buttonContainer.appendChild(tabButton);
            allButtons[tabKey] = tabButton;

            tabButton.addEventListener("click", (e) => {
                if (!this.#config.rmb && e.ctrlKey) return;

                const prev = this.#activeExtension[mode];
                const next = this.#config.toggle && prev === tabKey ? null : tabKey;

                if (prev != null) {
                    allButtons[prev].classList.remove("selected");
                    extensions[prev].style.display = "none";
                }

                this.#activeExtension[mode] = next;

                if (next != null) {
                    allButtons[next].classList.add("selected");
                    extensions[next].style.display = "block";
                }
            });

            extensionContainers[pos].appendChild(extensions[tabKey]);

            if (tabKey === "Scripts") {
                const scriptsDropdown = extensions[tabKey].querySelector("input");

                const observer = new MutationObserver(() => {
                    allButtons["Scripts"].classList.toggle("active", scriptsDropdown.value !== "None");
                });
                observer.observe(extensions[tabKey], { childList: true, subtree: true });

                if (this.#config.scripts_toggle) {
                    const btn = document.getElementById(`TABSEX_${mode}2img_s_toggle`);
                    this.#bindToggle(tabButton, () => btn.click());
                }

                continue;
            }

            const enableToggle = this.#tryFindEnableToggle(extensions[tabKey]);
            if (enableToggle == null) continue;

            this.#bindToggle(tabButton, () => enableToggle.click());

            // Check if already Enabled on Start; Link the Elements to Change Color if Enabled
            this.#enablePairs.push([enableToggle, tabButton]);
            tabButton.classList.toggle("active", enableToggle.checked);
        }

        // Hide Empty Containers
        for (const side of ["above", "left", "below", "right"]) {
            if (extensionContainers[side].children.length === 0) extensionContainers[side].remove();
        }

        // Open the first Extension at the start
        if (this.#config.open) Object.values(allButtons)[0]?.click();

        return configs;
    }

    static init() {
        this.#config = new TabsExtensionConfigs();
        const configs = this.#config.parseConfigs();
        const processedConfigs = {};

        for (const mode of ["txt", "img"]) {
            const keepExtensions = Object.keys(configs[mode]).filter((ext) => configs[mode][ext] === "keep");

            try {
                const parsed = TabsExtensionParser.parse(mode, keepExtensions);
                const extensions = this.#sort_extensions(parsed, configs[mode]);

                processedConfigs[mode] = this.#setup_tabs(mode, extensions, configs[mode]);

                if (this.#config.container)
                    document.getElementById(`${mode}2img_script_container`).querySelector(".styler").style.display = "none";
            } catch (e) {
                alert(`[TabsExtension] Something went wrong during ${mode}2img setup:\n${e}`);
            }
        }

        // shortcut: only save if at least one mode succeeded; upgrade: handle partial failure per mode
        if (Object.keys(processedConfigs).length > 0) {
            try {
                this.#config.saveConfigs(processedConfigs);
            } catch (e) {
                alert(`[TabsExtension] Something went wrong while saving configs:\n${e}`);
            }
        }

        document.addEventListener("click", () => this.#refreshEnableCheckbox());
    }
}

(function () {
    onUiLoaded(() => {
        const delay = document.getElementById("setting_tabs_ex_delay")?.querySelector("input[type=range]")?.value ?? 50;
        setTimeout(() => TabsExtension.init(), delay);
    });
})();
