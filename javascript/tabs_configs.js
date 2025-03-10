class TabsExtensionConfigs {
    #settings = {};

    /** @returns {boolean} */  get container() { return this.#settings.container; }
    /** @returns {boolean} */  get forge() { return this.#settings.forge; }
    /** @returns {boolean} */  get open() { return this.#settings.open; }
    /** @returns {boolean} */  get sort() { return this.#settings.sort; }
    /** @returns {boolean} */  get toggle() { return this.#settings.toggle; }
    /** @returns {boolean} */  get scripts_toggle() { return this.#settings.scripts_toggle; }
    /** @returns {boolean} */  get rmb() { return this.#settings.rmb; }
    /** @returns {boolean} */  get version() { return this.#settings.version; }

    constructor() {
        const settingsIDs = [
            ['container', 'checkbox'],
            ['forge', 'checkbox'],
            ['open', 'checkbox'],
            ['sort', 'checkbox'],
            ['toggle', 'checkbox'],
            ['scripts_toggle', 'checkbox'],
            ['rmb', 'checkbox'],
            ['version', 'checkbox']
        ];

        for (const [key, type] of settingsIDs) {
            const element = document.getElementById(`setting_tabs_ex_${key}`).querySelector(`input[type=${type}]`);
            this.#settings[key] = (type === 'checkbox') ? element.checked : element.value;
        }
    }

    /** @param {string} name @param {string} mode @return {string} */
    #validateMode(name, mode) {
        const availableModes = (name === "tabs") ?
            ["left", "right"] : ["left", "right", "above", "below", "hide", "keep"];

        return availableModes.includes(mode) ? mode : availableModes[0];
    }

    /**
     * Convert CSV to Dict
     * @return {{string: {string: string}}}
     */
    parseConfigs() {
        try {
            const config = { "txt": {}, "img": {} };

            const label = document.getElementById('TABSEX_LBL').querySelector('textarea');
            const lines = label.value.trim().split('\n').slice(1);

            for (const line of lines) {
                const [ext, t, i] = line.split(',').map(col => col.trim());
                config["txt"][ext] = this.#validateMode(ext, t);
                config["img"][ext] = this.#validateMode(ext, i);
            }

            return config;
        } catch (e) {
            alert(`[Tabs Extension]: Something went wrong while parsing the configs...\n${e}`);
            return {
                "txt": { 'tabs': 'left', 'default': 'left' },
                "img": { 'tabs': 'right', 'default': 'right' }
            }
        }
    }

    /**
     * Convert Dict to CSV
     * @param {{string: {string: string}}} config
     */
    saveConfigs(config) {
        const label = document.getElementById('TABSEX_LBL').querySelector('textarea');
        const data = [",txt,img"];

        for (const key of Object.keys(config["txt"]))
            data.push([key, config["txt"][key], config["img"][key]].join(","));

        label.value = data.join("\n");
        updateInput(label);

        const btn = document.getElementById('TABSEX_BTN');
        btn.click();
    }
}
