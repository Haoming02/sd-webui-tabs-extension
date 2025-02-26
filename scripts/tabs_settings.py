from modules.script_callbacks import on_ui_settings, on_before_ui
from modules.shared import opts, OptionInfo


def add_ui_settings():
    import gradio as gr

    section = ("ui_tabs_ex", "Tabs Extension")

    opts.add_option(
        "tabs_ex_delay",
        OptionInfo(
            50,
            "Delay (ms) before moving the Extensions",
            gr.Slider,
            {"minimum": 0, "maximum": 500, "step": 25},
            section=section,
            category_id="ui",
        ).needs_reload_ui(),
    )

    opts.add_option(
        "tabs_ex_act_color",
        OptionInfo(
            "greenyellow",
            "Color for active Extensions",
            section=section,
            category_id="ui",
        )
        .link("CSS", "https://www.w3schools.com/cssref/css_colors.php")
        .needs_reload_ui(),
    )

    opts.add_option(
        "tabs_ex_version",
        OptionInfo(
            False,
            "Hide the version number",
            section=section,
            category_id="ui",
        ).needs_reload_ui(),
    )

    opts.add_option(
        "tabs_ex_forge",
        OptionInfo(
            False,
            'Hide the "Integrated" text',
            section=section,
            category_id="ui",
        )
        .info('for <a href="https://github.com/lllyasviel/stable-diffusion-webui-forge">Forge</a>')
        .needs_reload_ui(),
    )

    opts.add_option(
        "tabs_ex_sort",
        OptionInfo(
            False,
            "Sort Extensions based on Configs",
            section=section,
            category_id="ui",
        ).needs_reload_ui(),
    )

    opts.add_option(
        "tabs_ex_toggle",
        OptionInfo(
            False,
            "Allow hiding the extension content when clicking on the same tab button again",
            section=section,
            category_id="ui",
        ).needs_reload_ui(),
    )

    opts.add_option(
        "tabs_ex_open",
        OptionInfo(
            True,
            "Automatically show the first extension tab on startup",
            section=section,
            category_id="ui",
        ).needs_reload_ui(),
    )

    opts.add_option(
        "tabs_ex_container",
        OptionInfo(
            False,
            "Hide the Extension container",
            section=section,
            category_id="ui",
        )
        .info("In certain configurations, the original Extension container will show up as an empty space in the Webui. You can enable this to hide the container")
        .needs_reload_ui(),
    )


def load_ui_settings():
    import os.path

    color = getattr(opts, "tabs_ex_act_color", "greenyellow").strip().lower()

    CSS = os.path.join(os.path.dirname(os.path.dirname(__file__)), "style.css")
    with open(CSS, "r") as file:
        styles = file.readlines()

    ln = 1
    assert "--tabs-highlight-color:" in styles[ln]

    key, part = styles[ln].split(":")
    current_color = part.split(";")[0].strip().lower()

    if current_color == color:
        return

    styles[ln] = f"{key}: {color};\n"

    with open(CSS, "w") as file:
        file.writelines(styles)


on_ui_settings(add_ui_settings)
on_before_ui(load_ui_settings)
