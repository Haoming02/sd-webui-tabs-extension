function tryFindEnableToggle(extension) {
    const ts = extension.querySelectorAll('input[type=checkbox]');

    for (let i = 0; i < ts.length; i++) {
        if (ts[i].parentNode.querySelector('span').innerHTML.toLowerCase().includes('enable'))
            return ts[i];
    }

    return null;
}

function setup_tabs(mode, extensions) {

    const container = document.getElementById((mode === 'txt') ? "txt2img_script_container" : "img2img_results");

    // Div to host the buttons
    const tabsContainer = document.createElement("div");
    tabsContainer.id = 'tabs_ex_' + mode;

    // Div to host the contents
    const contentContainer = document.createElement("div");
    contentContainer.id = 'tabs_ex_content_' + mode;

    container.appendChild(tabsContainer);
    container.appendChild(contentContainer);

    const allButtons = {};

    Object.keys(extensions).forEach(tabKey => {
        const tabButton = document.createElement("button");

        tabButton.classList.add('tab_button');
        tabButton.textContent = tabKey;

        tabsContainer.appendChild(tabButton);
        allButtons[tabKey] = tabButton;

        tabButton.addEventListener("click", () => {
            Object.values(extensions).forEach(tabDiv => {
                tabDiv.style.display = "none";
            });

            Object.values(allButtons).forEach(tabBtn => {
                tabBtn.classList.remove('selected');
            });

            extensions[tabKey].style.display = "block";
            allButtons[tabKey].classList.add('selected');
        });

        contentContainer.appendChild(extensions[tabKey]);

        if (tabKey !== 'Scripts') {
            const enableToggle = tryFindEnableToggle(extensions[tabKey]);

            if (enableToggle != null) {
                // Change Color if Enabled
                enableToggle.addEventListener('change', () => {
                    if (enableToggle.checked)
                        allButtons[tabKey].classList.add('active');
                    else
                        allButtons[tabKey].classList.remove('active');
                });

                // Ctrl + Click = Toggle
                allButtons[tabKey].addEventListener('click', (e) => {
                    if (window.event.ctrlKey)
                        enableToggle.click();
                });
            }
        }
    });

    // Select the first option at the start
    Object.values(extensions)[0].style.display = "block";
    Object.values(allButtons)[0].classList.add('selected');

    // Check for active Script
    const scriptsDropdown = extensions['Scripts'].querySelector('input');

    container.addEventListener('click', () => {
        if (scriptsDropdown.value === 'None')
            allButtons['Scripts'].classList.remove('active');
        else
            allButtons['Scripts'].classList.add('active');
    });
}

function getDelay() {
    return gradioApp().getElementById('setting_tabs_ex_delay').querySelector('input[type=range]').value;
}

function shouldMoveButton() {
    return gradioApp().getElementById('setting_tabs_ex_move_t2i_btn').querySelector('input[type=checkbox]').checked;
}

onUiLoaded(async () => {

    // Delay to avoid breaking references during init
    setTimeout(() => {

        const to_delete = [];

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

                    extensions['Scripts'] = script_block;
                    to_delete.push(container[i]);

                    break;
                }

                // Grab the actual Extension content
                var extension = container[i].children[0];

                // Ignore Extension with no UI
                if (extension.children.length > 0) {

                    // Some Extensions have less/more layers of div
                    try {
                        while (extension.children.length < 2 || extension.children[1].children.length < 1 || extension.children[1].children[0].tagName.toLowerCase() !== 'span')
                            extension = extension.children[0];
                    } catch {
                        // Unrecognized Structure
                        continue;
                    }

                    to_delete.push(container[i]);

                    const extension_name = extension.children[1].children[0].innerHTML;
                    const extension_content = extension.children[2];

                    extension_content.id = container[i].children[0].children[0].id;

                    extensions[extension_name] = extension_content;
                }
            }

            setup_tabs(mode, extensions);
        });

        setTimeout(() => {
            for (let i = 0; i < to_delete.length; i++)
                to_delete[i].remove();

            if (shouldMoveButton())
                document.getElementById("txt2img_results").appendChild(document.getElementById("tabs_ex_txt"));
        }, getDelay());

    }, getDelay());

});
