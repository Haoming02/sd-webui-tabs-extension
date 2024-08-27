class TabsExtensionParser {

    /** @param {boolean} enabled @returns {Element} */
    static #cloneCheckbox(enabled) {
        const label = document.getElementById("TABSEX_CHECKBOX").querySelector('label').cloneNode(true);
        label.style.margin = "1em 0em";

        label.checkbox = label.querySelector("input");
        label.checkbox.checked = enabled;

        return label;
    }

    /**
     * Remove version number from Extension Name (as it will keep updating...)
     * @param {string} name
     * @returns {string}
     */
    static #sanitizeExtensionName(name) {
        if (name.trim().length == 0)
            return null;

        const version_pattern = /([Vv](er)?(\.|\s)*\d)/;
        return name.split(version_pattern)[0].trim();
    }

    /**
     * @param {Element} node
     * @returns {[string, Element]}
     */
    static #parseObject(node) {
        if (node.classList.contains("form")) {
            const script_block = document.createElement("div");
            script_block.style.display = 'none';

            const scripts = node.querySelector(".gradio-dropdown");
            scripts.style.margin = '10px 0px';
            script_block.appendChild(scripts);

            return ["Scripts", script_block];
        }

        const styler = node.querySelector(".styler");
        if (styler == null)
            return [null, null];

        const accordion = node.querySelector(".gradio-accordion");
        if (accordion == null)
            return [null, null];

        const isInput = accordion.classList.contains("input-accordion");

        const displayName = accordion.querySelector(".label-wrap>span")?.textContent;
        if (displayName == null)
            return [null, null];

        const extensionName = this.#sanitizeExtensionName(displayName);

        const contents = [...accordion.children].filter((div) => (
            (!div.classList.contains("hide")) && (!div.classList.contains("label-wrap")) && (div.children.length > 0)
        ));

        if ((extensionName == null) || (contents.length === 0))
            return [null, null];

        const content = contents[0];

        if (isInput) {
            const checkbox = accordion.querySelector(".input-accordion-checkbox");

            // Create a dummy Checkbox linked to the original Checkbox
            const dummy = this.#cloneCheckbox(checkbox.checked);

            dummy.checkbox.onchange = () => {
                if (checkbox.checked !== dummy.checkbox.checked)
                    checkbox.click();
            };

            checkbox.onchange = () => {
                if (checkbox.checked !== dummy.checkbox.checked)
                    dummy.checkbox.click();
            };

            content.insertBefore(dummy, content.firstElementChild);
        }

        node.style.display = "none";
        if ((accordion.id != null) && (!accordion.id.startsWith("component-"))) {
            content.id = accordion.id;
            accordion.id = `.${accordion.id}`;
        }

        return [extensionName, content];
    }

    /**
     * @param {string} mode 'txt' | 'img'
     * @returns {[string, Element]}
     */
    static #extra_options(mode) {
        const extra_options = document.getElementById(`extra_options_${mode}2img`);
        if (extra_options == null || !extra_options.classList.contains("gradio-accordion"))
            return [null, null];

        const styler = extra_options.parentElement;
        styler.style.display = "none";

        const name = "Extra Options";

        const content = [...extra_options.children].filter((div) => (
            (!div.classList.contains("hide")) && (!div.classList.contains("label-wrap")) && (div.children.length > 0)
        ))[0];

        return [name, content];
    }

    /**
     * @param {string} mode 'txt' | 'img'
     * @returns {{string: Element}}
     */
    static parse(mode) {
        const validExtensions = {};

        // Get all Extensions & Scripts
        const container = document.getElementById(`${mode}2img_script_container`);
        const children = Array.from(container.querySelector(".styler").children);

        var count = 1;

        children.forEach((node) => {
            if (validExtensions.hasOwnProperty("Scripts")) {
                validExtensions["Scripts"].appendChild(node);
                return;
            }

            try {
                const [name, content] = this.#parseObject(node);

                if (name != null) {
                    validExtensions[name] = content;
                    count++;
                }
            } catch (e) {
                const id = node.querySelector(".gradio-accordion")?.id;
                if (id != null && id.indexOf("component-") === -1)
                    alert(`Something went wrong while parsing the ${count}-th Accordion (suspect: ${id})`);
                else
                    alert(`Something went wrong while parsing the ${count}-th Accordion\n${e}`);
            }
        });

        const [extra, options] = this.#extra_options(mode);

        if (extra != null)
            validExtensions[extra] = options;

        return validExtensions;
    }
}
