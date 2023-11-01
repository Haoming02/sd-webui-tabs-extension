# SD Webui Tabs Extension
<p align="right"><i><b>BETA</b></i></p>

This is an Extension for the [Automatic1111 Webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui), which changes the Extensions layout into a Tabs system instead.

This was achieved by moving the "contents" of each Extension, from the "Accordion" *(the dropdown thingy)* into a Tabs system, 
so that you only need to switch between each tab to change the settings, intead of scrolling all the way down then all the way up every single time, especially when you have multiple Extensions active...
Additionally, the `Scripts` section is also moved into a tab.

By default, the Tabs for `txt2img` are placed under the settings (the same position); while the Tabs for `img2img` are placed under the Generation Results, 
since the image setttings are already significantly longer.

<p align="center"><img src="demo.jpg" width=768></p>

## Settings
> The settings are in the **User interface** section
- **Delay:** The Extension moves the contents after a tiny delay, to prevent breaking some references. If you have a slower machine, you *may* need to increase the delay.
- **Move t2i Buttons:** Move the Tabs buttons *(not the contents)* under the Generation Results as well, attempting to further "balance" the height of left side and right side.

<hr>

<sup> **Note:** This Extension is still ***experimental***. The few Extensions I installed worked fine during my testings. Though, I cannot guarantee that every single Extension would function properly. </sup>
