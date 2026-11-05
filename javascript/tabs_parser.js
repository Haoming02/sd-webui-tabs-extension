class TabsExtensionParser {
    /** @param {boolean} enabled @returns {HTMLInputElement} */
    static #cloneCheckbox(enabled) {
        const label = document.getElementById("TABSEX_CHECKBOX").querySelector("label").cloneNode(true);
        label.style.margin = "1em 0em";

        label.checkbox = label.querySelector("input");
        label.checkbox.checked = enabled;

        return label;
    }

    /**
     * Remove version number from Extension Name (as it will keep updating...)
     * @param {string} name @returns {string}
     */
    static #sanitizeExtensionName(name) {
        if (name.trim().length == 0) return null;

        const version_pattern = /([Vv](?:er)?[\.\s]*\d)/;
        return name.split(version_pattern)[0].trim();
    }

    /**
     * First visible non-label child of an Accordion
     * @param {HTMLDivElement} accordion @returns {HTMLDivElement}
     */
    static #firstContent(accordion) {
        return (
            [...accordion.children].find(
                (div) => !div.classList.contains("hide") && !div.classList.contains("label-wrap") && div.children.length > 0,
            ) ?? null
        );
    }

    /**
     * @param {HTMLDivElement} node
     * @param {string[]} keep
     * @returns {[string, HTMLDivElement]}
     */
    static #parseObject(node, keep) {
        if (node.classList.contains("form")) {
            const script_block = document.createElement("div");
            script_block.style.display = "none";

            const scripts = node.querySelector(".gradio-dropdown");
            scripts.style.margin = "10px 0px";
            script_block.appendChild(scripts);

            script_block.setAttribute("ext-label", "Scripts");
            return ["Scripts", script_block];
        }

        if (node.querySelector(".styler") == null || node.querySelector(".gradio-accordion") == null) return [null, null];

        const accordion = node.querySelector(".gradio-accordion");
        const displayName = accordion.querySelector(".label-wrap>span")?.textContent;

        const extensionName = displayName == null ? null : this.#sanitizeExtensionName(displayName);
        if (extensionName == null || keep.includes(extensionName)) return [null, null];

        const content = this.#firstContent(accordion);
        if (content == null) return [null, null];

        const isInput = accordion.classList.contains("input-accordion");

        if (isInput) this.#linkCheckbox(content, accordion);

        node.style.display = "none";
        if (accordion.id && !accordion.id.startsWith("component-")) {
            content.id = accordion.id;
            accordion.id = `.${accordion.id}`;

            if (isInput) {
                // Prevent Errors in Console...
                content.visibleCheckbox = { checked: null };
                content.onVisibleCheckboxChange = () => { };
            }
        }

        content.setAttribute("ext-label", displayName);
        return [extensionName, content];
    }

    /**
     * Dummy Checkbox synced with the original InputAccordion Checkbox
     * @param {HTMLDivElement} content @param {HTMLInputElement} accordion
     */
    static #linkCheckbox(content, accordion) {
        const checkbox = accordion.querySelector(".input-accordion-checkbox");

        // Create a dummy Checkbox linked to the original Checkbox
        const dummy = this.#cloneCheckbox(checkbox.checked);

        const sync = (from, to) => {
            if (from.checked !== to.checked) to.click();
        };

        dummy.checkbox.onchange = () => sync(dummy.checkbox, checkbox);
        checkbox.onchange = () => sync(checkbox, dummy.checkbox);

        content.insertBefore(dummy, content.firstElementChild);
    }

    /**
     * @param {string} mode 'txt' | 'img'
     * @returns {[string, HTMLDivElement]}
     */
    static #extra_options(mode) {
        const extra_options = document.getElementById(`extra_options_${mode}2img`);
        if (extra_options == null || !extra_options.classList.contains("gradio-accordion")) return [null, null];

        extra_options.parentElement.style.display = "none";

        const content = this.#firstContent(extra_options);
        if (content == null) return [null, null];

        content.setAttribute("ext-label", "Extra Options");
        return ["Extra Options", content];
    }

    /**
     * @param {string} mode 'txt' | 'img'
     * @param {string[]} keep
     * @returns {{string: HTMLDivElement}}
     */
    static parse(mode, keep) {
        const validExtensions = {};

        // Get all Extensions & Scripts
        const container = document.getElementById(`${mode}2img_script_container`);

        // Snapshot: nodes get moved while parsing
        Array.from(container.querySelector(".styler").children).forEach((node) => {
            if (validExtensions["Scripts"] != null) {
                validExtensions["Scripts"].appendChild(node);
                return;
            }

            const [name, content] = this.#parseObject(node, keep);
            if (name != null) validExtensions[name] = content;
        });

        const [extra, options] = this.#extra_options(mode);
        if (extra != null) validExtensions[extra] = options;

        return validExtensions;
    }
}
