﻿# SD Webui Tabs Extension
This is an Extension for the [Automatic1111 Webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui), which replaces the original Extension layout with a Tab System instead.

> Also supports [Forge](https://github.com/lllyasviel/stable-diffusion-webui-forge)!

## Features
This was achieved by moving the *contents* of each Extension from the "Accordion" *(the dropdown thingy)* into their own separate Tabs,
so that you only need to switch between each tab to change the settings, instead of scrolling all the way down and then all the way up every single time. Clicking on the opened tab button will hide it instead.
This is especially helpful if you usually have multiple Extensions active.
Additionally, the `Scripts` section is also moved into a tab.

When an Extension or a Script is enabled, the respective Tab button will turn green[*](#settings) to indicate that. Furthermore, you can `Ctrl + Click` the Tab buttons to quickly toggle the Extensions.
> This tries to find the first Checkbox with a label containing "enable" or "active" within the Extension. If one is not found, then this feature will not be available for said Extension.

> For ControlNet, this only works on the first Unit. Still thinking of a better solution...

<p align="center"><img src="demo.jpg" width=768></p>

## Configs
After launching the Webui *(including the browser, not just the console)* with this Extension installed, it will generate a `tab_configs.csv` file inside the Extension folder.

- You can edit this file to change which side each element is placed.
    - **left** side refers to under the parameters *(the original location)*
    - **right** side refers to under the generation Results
    - The `tabs` entry controls where the Tab buttons are placed
    - The `default` entry controls where each new Extension not in the config should be placed
    - The rest *should* be the entries of all available Extensions

- You can open the `.csv` file with any text editing program *(**eg.** `Notepad`)* or a spreadsheet program *(**eg.** `Excel`)*.
- Recommended to not touch the first row or the first column.
- **Important:** If you edited the `.csv` file while the Webui is active, you should click **Reload UI** *(not refresh the browser)* to apply the changes.
- <ins>Format</ins>

    |     | txt | img |
    |-----|-----|-----|
    | tabs| left|right|
    |default|left|right|
    |\<extension\>|left|right|
    | ... | left|right|

### Settings
> The settings are in the **User interface** section
- **Delay:** This Extension moves the contents after a tiny delay to prevent breaking some references. If you have a slow machine, you *may* need to increase the delay.
- **Color:** The color used to indicate active extensions. *(**Default:** `GreenYellow`)*
- **Forge:** Hide the "Integrated" text for the built-in Extensions.
- **Sort:** By default, extensions are sorted based on their appearance order *(**ie.** The extension folder names)*. Enable this to sort them based on the order in the `tab_configs.csv`.
- **Open:** By default, first extension is shown. You can hide all the extensions on start up instead.
