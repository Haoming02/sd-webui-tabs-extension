const CONFIG = {};

function tryFindEnableToggle(extension) {
    const ts = extension.querySelectorAll('input[type=checkbox]');

    // Try to find "enable" first
    for (let i = 0; i < ts.length; i++) {
        const label = ts[i].parentNode.querySelector('span');
        if (label != null && label.textContent.toLowerCase().includes('enable'))
            return ts[i];
    }

    // Then to find "active" second
    for (let i = 0; i < ts.length; i++) {
        const label = ts[i].parentNode.querySelector('span');
        if (label != null && label.parentNode.querySelector('span').textContent.toLowerCase().includes('active'))
            return ts[i];
    }

    // Null otherwise
    return null;
}

function rvExtName(input) {
    // Remove version info from Extension Name (since it will keep updating...)
    const version_pattern = /([Vv](er)?(\.|\s)*\d)/;
    return input.split(version_pattern)[0].trim();
}

function sort_extensions(ext) {
    const sorted = {};

    Object.keys(CONFIG).forEach((key) => {
        if (ext.hasOwnProperty(key)) {
            sorted[key] = ext[key];
            delete ext[key];
        }
    });

    Object.keys(ext).forEach((key) => {
        sorted[key] = ext[key];
    });

    return sorted;
}

function setup_tabs(mode, ext) {

    const extensions = doSort() ? sort_extensions(ext) : ext;

    const container = {};
    container['left'] = document.getElementById(mode + '2img_script_container');
    container['right'] = document.getElementById(mode + '2img_results');

    // Div to host the buttons
    const tabsContainer = document.createElement("div");
    tabsContainer.id = 'tabs_ex_' + mode;

    container[CONFIG['tabs'][mode]].appendChild(tabsContainer);

    // Div to host the contents
    const contentContainer = {};

    var height = 0;
    Object.keys(extensions).forEach(tabKey => {
        extensions[tabKey][1].style.display = 'block';
        height = Math.max(height, extensions[tabKey][1].clientHeight);
        extensions[tabKey][1].style.display = 'none';
    });

    ['left', 'right'].forEach((side) => {
        contentContainer[side] = document.createElement("div");
        contentContainer[side].id = `tabs_ex_content_${mode}_${side}`;
        contentContainer[side].style.overflow = "visible";
        contentContainer[side].style.minHeight = `calc(${height}px + 1em)`;
        container[side].appendChild(contentContainer[side]);
    });

    const allButtons = {};

    Object.keys(extensions).forEach(tabKey => {
        if (!CONFIG.hasOwnProperty(tabKey))
            CONFIG[tabKey] = CONFIG['default'];

        const tabButton = document.createElement("button");
        tabButton.classList.add('tab_button');

        if (tabKey === 'Scripts') {
            const scriptSpan = document.createElement('span');
            scriptSpan.textContent = 'Scripts';
            scriptSpan.className = 'tab_label';
            tabButton.appendChild(scriptSpan);
        } else {
            extensions[tabKey][0].removeAttribute('id');
            extensions[tabKey][0].className = 'tab_label';
            tabButton.appendChild(extensions[tabKey][0]);

            if (isForge())
                extensions[tabKey][0].textContent = extensions[tabKey][0].textContent.split('Integrated')[0].trim();
        }

        tabsContainer.appendChild(tabButton);
        allButtons[tabKey] = tabButton;

        tabButton.addEventListener("click", (e) => {
            if (e.ctrlKey)
                return;

            if (allButtons[tabKey].classList.contains('selected')) {
                extensions[tabKey][1].style.display = "none";
                allButtons[tabKey].classList.remove('selected');
            } else {
                Object.values(extensions).forEach(tabDiv => {
                    tabDiv[1].style.display = "none";
                });

                Object.values(allButtons).forEach(tabBtn => {
                    tabBtn.classList.remove('selected');
                });

                extensions[tabKey][1].style.display = "block";
                allButtons[tabKey].classList.add('selected');
            }
        });

        contentContainer[CONFIG[tabKey][mode]].appendChild(extensions[tabKey][1]);

        if (tabKey !== 'Scripts') {
            const enableToggle = tryFindEnableToggle(extensions[tabKey][1]);

            if (enableToggle != null) {
                // Change Color if Enabled
                ["input", "change"].forEach(ev => {
                    enableToggle.addEventListener(ev, () => {
                        if (enableToggle.checked)
                            allButtons[tabKey].classList.add('active');
                        else
                            allButtons[tabKey].classList.remove('active');
                    });
                });

                // Ctrl + Click = Toggle
                allButtons[tabKey].addEventListener('click', (e) => {
                    if (e.ctrlKey)
                        enableToggle.click();
                });

                // Check if already Enabled on start up
                if (enableToggle.checked)
                    allButtons[tabKey].classList.add('active');
            }
        }
    });

    // Select the first option at the start
    if (autoOpen()) {
        Object.values(extensions)[0][1].style.display = "block";
        Object.values(allButtons)[0].classList.add('selected');
    }

    // Check for active Script
    const scriptsDropdown = extensions['Scripts'][1].querySelector('input');
    const tab = document.getElementById('tab_' + mode + '2img');

    tab.addEventListener('click', () => {
        if (scriptsDropdown.value === 'None')
            allButtons['Scripts'].classList.remove('active');
        else
            allButtons['Scripts'].classList.add('active');
    });
}

function getDelay() {
    return gradioApp().getElementById('setting_tabs_ex_delay').querySelector('input[type=range]').value;
}

function isForge() {
    return gradioApp().getElementById('setting_tabs_ex_forge').querySelector('input[type=checkbox]').checked;
}

function doSort() {
    return gradioApp().getElementById('setting_tabs_ex_sort').querySelector('input[type=checkbox]').checked;
}

function autoOpen() {
    return gradioApp().getElementById('setting_tabs_ex_open').querySelector('input[type=checkbox]').checked;
}

function saveConfigs() {
    const label = document.getElementById('TABSEX_LB').querySelector('textarea');
    const button = document.getElementById('TABSEX_BT');

    const keys = Object.keys(CONFIG);
    var data = ",txt,img\n";

    for (let i = 0; i < keys.length; i++) {
        data += keys[i];
        data += ',';
        data += CONFIG[keys[i]]['txt'];
        data += ',';
        data += CONFIG[keys[i]]['img'];
        data += '\n';
    }

    label.value = data;
    updateInput(label);

    setTimeout(() => {
        button.click();
        button.parentElement.parentElement.remove();
    }, getDelay());
}

function parseConfigs() {
    // Convert csv into dict
    const label = document.getElementById('TABSEX_LB').querySelector('textarea');
    const lines = label.value.trim().split('\n');

    try {
        if (lines[0].split(',')[0].trim().length > 0)
            throw "Old Configs...";

        const L = lines.length;
        const t2i = lines[0].split(',')[1].trim();
        const i2i = lines[0].split(',')[2].trim();

        for (let i = 1; i < L; i++) {
            const values = lines[i].split(',').map(val => val.trim());
            if (values.length > 3)
                throw "Invalid Configs";

            CONFIG[values[0]] = {};

            if ((values[1] !== "left" && values[1] !== "right") ||
                (values[2] !== "left" && values[2] !== "right"))
                throw "Invalid Configs...";

            CONFIG[values[0]][t2i] = values[1];
            CONFIG[values[0]][i2i] = values[2];
        }
    } catch {
        alert('[Tabs Extension] Something went wrong while parsing the configs. Restoring to defaults...');
        for (const key in CONFIG)
            delete CONFIG[key];

        CONFIG['tabs'] = {};
        CONFIG['tabs']['txt'] = 'left';
        CONFIG['tabs']['img'] = 'right';
        CONFIG['default'] = {};
        CONFIG['default']['txt'] = 'left';
        CONFIG['default']['img'] = 'right';
    }
}

function stealGradioCheckbox(MYcheckbox, MYspan) {
    const setting = document.getElementById('tab_settings');
    const label = setting.querySelector('input[type=checkbox]').parentElement.cloneNode(true);

    label.removeChild(label.firstChild);
    label.insertBefore(MYcheckbox, label.firstChild);
    label.querySelector('span').textContent = MYspan;

    return label;
}

onUiLoaded(async () => {

    parseConfigs();

    // Delay to avoid breaking references during init
    setTimeout(() => {

        const to_delete = [];
        const to_hide = [];

        // Works for both txt2img & img2img
        ['txt', 'img'].forEach((mode) => {

            // Get all Extensions & Scripts
            const container = document.getElementById(mode + '2img_script_container').children[0].children;

            const extensions = {};

            for (let i = 0; i < container.length; i++) {

                // Scripts Dropdown
                if (container[i].classList.contains('form')) {
                    container[i].children[0].style.margin = '10px 0px';

                    const script_block = document.createElement("div");
                    script_block.style.display = 'none';
                    script_block.appendChild(container[i].children[0]);

                    // Move all Scripts
                    for (let x = container.length - 1; x > i; x--)
                        script_block.appendChild(container[x]);

                    extensions['Scripts'] = [null, script_block];
                    to_delete.push(container[i]);

                    break;
                }

                // Grab the actual Extension content
                var extension = container[i].children[0];

                // Ignore Extension with no UI
                if (extension.children.length > 0) {

                    // Some Extensions have less/more layers of div
                    try {
                        while (extension.children.length < 2 || extension.children[1].children.length < 1 || extension.children[1].children[0].tagName.toLowerCase() !== 'span') {
                            if (extension.children[0].classList.contains('hidden')) {
                                if (extension.children[0].getAttribute('data-testid') == null) {
                                    // InputAccordion
                                    extension = extension.children[1];

                                    // Hide instead of Delete to avoid breaking references
                                    to_hide.push(container[i]);
                                } else {
                                    // sd-webui-fabric
                                    for (let i = 1; i < extension.children.length; i++) {
                                        if (extension.children[i].getAttribute('data-testid') == null) {
                                            extension = extension.children[i];
                                            break;
                                        }
                                    }
                                }
                            }
                            else
                                extension = extension.children[0];
                        }
                    } catch {
                        // Unrecognized Structure
                        continue;
                    }

                    if (!to_hide.includes(container[i]))
                        to_delete.push(container[i]);

                    const extension_name = extension.children[1].children[0];
                    const extension_content = extension.children[2];

                    if (
                        container[i].children[0].children[0].classList.contains('hidden')
                        &&
                        container[i].children[0].children[0].getAttribute('data-testid') == null
                    ) {
                        // InputAccordion
                        extension_content.id = container[i].children[0].children[1].id;

                        const checkbox = extension_name.querySelector('input[type=checkbox]');
                        if (!checkbox)
                            continue;

                        // Create a dummy Checkbox linked to the original Checkbox
                        const checkbox_dummy = checkbox.cloneNode();
                        checkbox_dummy.addEventListener('change', () => {
                            if (checkbox.checked !== checkbox_dummy.checked)
                                checkbox.click();
                        });

                        const label = stealGradioCheckbox(checkbox_dummy, 'Enable');
                        label.style.margin = "1em 0px";

                        // Add to the top as the "Enable" Checkbox
                        extension_content.insertBefore(label, extension_content.firstChild);

                        // Copy the label to avoid breaking references
                        const extension_name_dummy = extension_name.cloneNode(true);
                        extension_name_dummy.querySelector('input[type=checkbox]')?.remove();
                        extensions[rvExtName(extension_name_dummy.textContent.trim())] = [extension_name_dummy, extension_content];
                    }
                    else {
                        extension_content.id = container[i].children[0].children[0].id;
                        extensions[rvExtName(extension_name.textContent.trim())] = [extension_name, extension_content];
                    }
                }
            }

            const extra_options = gradioApp().getElementById(`extra_options_${mode}2img`);
            if (extra_options != null && extra_options.childElementCount === 3) {
                const extension_name = extra_options.children[1].children[0];
                const extension_content = extra_options.children[2];
                extension_content.id = `extra_options_${mode}2img`;
                extensions[rvExtName(extension_name.textContent.trim())] = [extension_name, extension_content];
                to_hide.push(extra_options.parentElement.parentElement);
            }

            setup_tabs(mode, extensions);
        });

        setTimeout(() => {
            for (let i = 0; i < to_delete.length; i++)
                to_delete[i].remove();
            for (let i = 0; i < to_hide.length; i++)
                to_hide[i].style.display = 'none';

            saveConfigs();
        }, getDelay());

    }, getDelay());

});
