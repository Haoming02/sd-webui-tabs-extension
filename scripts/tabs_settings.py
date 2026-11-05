from modules.script_callbacks import on_before_ui, on_ui_settings
from modules.shared import OptionInfo, opts


def add_ui_settings():
    from gradio import Slider

    args = {"section": ("ui_tabs_ex", "Tabs Extension"), "category_id": "ui"}

    opts.add_option(
        "tabs_ex_delay",
        OptionInfo(
            50,
            "Delay (ms) before moving the Extensions",
            Slider,
            {"minimum": 0, "maximum": 500, "step": 25},
            **args,
        ).needs_reload_ui(),
    )

    opts.add_option(
        "tabs_ex_act_color",
        OptionInfo(
            "greenyellow",
            "Color for active Extensions",
            **args,
        )
        .link("CSS", "https://www.w3schools.com/cssref/css_colors.php")
        .needs_reload_ui(),
    )

    opts.add_option(
        "tabs_ex_version",
        OptionInfo(
            False,
            "Hide the version number",
            **args,
        ).needs_reload_ui(),
    )

    opts.add_option(
        "tabs_ex_forge",
        OptionInfo(
            False,
            'Hide the "Integrated" text',
            **args,
        )
        .info("for <b>Forge</b>")
        .needs_reload_ui(),
    )

    opts.add_option(
        "tabs_ex_sort",
        OptionInfo(
            False,
            "Sort Extensions based on Configs",
            **args,
        ).needs_reload_ui(),
    )

    opts.add_option(
        "tabs_ex_toggle",
        OptionInfo(
            False,
            "Allow hiding the extension content when clicking on the same tab button again",
            **args,
        ).needs_reload_ui(),
    )

    opts.add_option(
        "tabs_ex_scripts_toggle",
        OptionInfo(
            False,
            "Allow Ctrl + Click to toggle the Scripts dropdown as well",
            **args,
        ).needs_reload_ui(),
    )

    opts.add_option(
        "tabs_ex_rmb",
        OptionInfo(
            False,
            "Use Right Click instead of Ctrl + Click for toggling Extensions",
            **args,
        ).needs_reload_ui(),
    )

    opts.add_option(
        "tabs_ex_open",
        OptionInfo(
            True,
            "Automatically show the first extension tab on startup",
            **args,
        ).needs_reload_ui(),
    )

    opts.add_option(
        "tabs_ex_container",
        OptionInfo(
            False,
            "Hide the Extension container",
            **args,
        )
        .info("in certain styles, the container would show up as an empty space")
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
