class TabsExtensionConfigs {

    #delay;
    /** @return {number} */
    get delay() { return this.#delay; };

    #version;
    /** @return {boolean} */
    get version() { return this.#version; }

    #forge;
    /** @return {boolean} */
    get forge() { return this.#forge; }

    #sort;
    /** @return {boolean} */
    get sort() { return this.#sort; }

    #toggle;
    /** @return {boolean} */
    get toggle() { return this.#toggle; }

    #open;
    /** @return {boolean} */
    get open() { return this.#open; }

    #container;
    /** @return {boolean} */
    get container() { return this.#container; }

    constructor() {
        this.#delay = document.getElementById('setting_tabs_ex_delay').querySelector('input[type=range]').value;
        this.#version = document.getElementById('setting_tabs_ex_version').querySelector('input[type=checkbox]').checked;
        this.#forge = document.getElementById('setting_tabs_ex_forge').querySelector('input[type=checkbox]').checked;
        this.#sort = document.getElementById('setting_tabs_ex_sort').querySelector('input[type=checkbox]').checked;
        this.#toggle = document.getElementById('setting_tabs_ex_toggle').querySelector('input[type=checkbox]').checked;
        this.#open = document.getElementById('setting_tabs_ex_open').querySelector('input[type=checkbox]').checked;
        this.#container = document.getElementById('setting_tabs_ex_container').querySelector('input[type=checkbox]').checked;
    }

    /** @param {string} name @param {string} mode @return {string} */
    #validateMode(name, mode) {
        const availableModes = ["left", "right"];
        if (name !== "tabs")
            availableModes.push("above", "below", "hide");

        if (!availableModes.includes(mode))
            return availableModes[0];
        else
            return mode;
    }

    /**
     * Convert CSV to Dict
     * @return {{string: {string: string}}}
     */
    parseConfigs() {
        const config = {
            "txt": {},
            "img": {}
        };

        try {
            const label = document.getElementById('TABSEX_LBL').querySelector('textarea');
            const lines = label.value.trim().split('\n');

            const configCount = lines.length;
            for (let c = 1; c < configCount; c++) {
                const [ext, t, i] = lines[c].split(',').map(col => col.trim());
                config["txt"][ext] = this.#validateMode(ext, t);
                config["img"][ext] = this.#validateMode(ext, i);
            }
        } catch (e) {
            alert(`[Tabs Extension]: Something went wrong while parsing the configs...\n${e}`);

            return {
                "txt": {
                    'tabs': 'left',
                    'default': 'left'
                },
                "img": {
                    'tabs': 'right',
                    'default': 'right'
                }
            }
        }

        return config;
    }

    /**
     * Convert Dict to CSV
     * @param {{string: {string: string}}} config
     */
    saveConfigs(config) {
        const label = document.getElementById('TABSEX_LBL').querySelector('textarea');
        const data = [",txt,img"];

        const keys = Array.from(Object.keys(config["txt"]));

        keys.forEach((key) => {
            data.push([key, config["txt"][key], config["img"][key]].join(","));
        });

        label.value = data.join("\n");
        updateInput(label);

        const btn = document.getElementById('TABSEX_BTN');
        console.log("[TabsExtension] Saving Configs via ", btn);

        btn.click();
    }
}
