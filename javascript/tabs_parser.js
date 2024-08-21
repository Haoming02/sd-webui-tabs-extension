class TabsExtensionParser {

    static #setting = undefined;

    /** @returns {Element} */
    static #cloneCheckbox() {
        this.#setting ??= document.getElementById('tab_settings');
        const label = this.#setting.querySelector('input[type=checkbox]').parentElement.cloneNode(true);
        label.style.margin = "1em 0em";

        label.checkbox = label.querySelector("input");
        label.checkbox.checked = false;

        label.span = label.querySelector("span");
        label.span.textContent = "Enable";

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

        const displayName = accordion.querySelector(".label-wrap>span").textContent;
        const extensionName = this.#sanitizeExtensionName(displayName);

        const content = [...accordion.children].filter((div) => (
            (!div.classList.contains("hide")) && (!div.classList.contains("label-wrap")) && (div.children.length > 0)
        ))[0];

        if ((extensionName == null) || (content == null))
            return [null, null];

        node.style.display = "none";

        if (isInput) {
            const checkbox = accordion.querySelector(".input-accordion-checkbox");

            // Create a dummy Checkbox linked to the original Checkbox
            const dummy = this.#cloneCheckbox();

            if (checkbox.checked)
                dummy.checkbox.click();

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

        children.forEach((node) => {
            if (validExtensions.hasOwnProperty("Scripts")) {
                validExtensions["Scripts"].appendChild(node);
                return;
            }

            const [name, content] = this.#parseObject(node);

            if (name != null)
                validExtensions[name] = content;
        });

        const [extra, options] = this.#extra_options(mode);

        if (extra != null)
            validExtensions[extra] = options;

        return validExtensions;
    }
}
