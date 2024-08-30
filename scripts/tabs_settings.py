from modules.script_callbacks import on_ui_settings, on_before_ui
from modules.shared import opts, OptionInfo
from modules import scripts

import gradio as gr
import os


CSS = os.path.join(scripts.basedir(), "style.css")
section = ("ui", "User interface")


def add_ui_settings():

    opts.add_option(
        "tabs_ex_delay",
        OptionInfo(
            10,
            "Delay (ms) before moving the Extensions",
            gr.Slider,
            {"minimum": 10, "maximum": 500, "step": 10},
            section=section,
        ).needs_reload_ui(),
    )

    opts.add_option(
        "tabs_ex_act_color",
        OptionInfo("greenyellow", "Color for active Extensions", section=section)
        .link("CSS", "https://www.w3schools.com/cssref/css_colors.php")
        .needs_reload_ui(),
    )

    opts.add_option(
        "tabs_ex_forge",
        OptionInfo(False, 'Hide the "Integrated" text', section=section)
        .info("for SD-Webui-Forge")
        .needs_reload_ui(),
    )

    opts.add_option(
        "tabs_ex_sort",
        OptionInfo(
            False, "Sort Extensions based on Configs", section=section
        ).needs_reload_ui(),
    )

    opts.add_option(
        "tabs_ex_open",
        OptionInfo(
            True, "Automatically show the first extension tab on start", section=section
        ).needs_reload_ui(),
    )

    opts.add_option(
        "tabs_ex_container",
        OptionInfo(False, "Hide the Extension container", section=section)
        .info(
            "In certain configurations, the original Extension container will show up as an empty space in the Webui. You can enable this to hide the container."
        )
        .needs_reload_ui(),
    )


def load_ui_settings():
    color = getattr(opts, "tabs_ex_act_color", "greenyellow").strip().lower()
    ln = 1

    with open(CSS, "r") as FILE:
        styles = FILE.readlines()

    assert "--tabs-highlight-color:" in styles[ln]

    key, part = styles[ln].split(":")
    current_color = part.split(";")[0].strip().lower()

    if current_color == color:
        return

    styles[ln] = f"{key}: {color};\n"

    with open(CSS, "w") as FILE:
        FILE.writelines(styles)


on_ui_settings(add_ui_settings)
on_before_ui(load_ui_settings)
