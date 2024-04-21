from modules import script_callbacks, shared, scripts
import gradio as gr
import os


CSS = os.path.join(scripts.basedir(), 'style.css')
section = ('ui', "User interface")


def add_ui_settings():
    shared.opts.add_option("tabs_ex_delay", shared.OptionInfo(
        10, "Delay (ms) before moving the Extensions", gr.Slider, {"minimum": 10, "maximum": 500, "step": 10}, section=section).needs_reload_ui())
    shared.opts.add_option("tabs_ex_act_color", shared.OptionInfo(
        "greenyellow", 'Color for active Extensions', section=section).link("CSS", "https://www.w3schools.com/cssref/css_colors.php").needs_reload_ui())
    shared.opts.add_option("tabs_ex_forge", shared.OptionInfo(
        False, 'Hide the "Integrated" text', section=section).info('for SD-Webui-Forge').needs_reload_ui())
    shared.opts.add_option("tabs_ex_sort", shared.OptionInfo(
        False, 'Sort Extensions based on Configs', section=section).needs_reload_ui())
    shared.opts.add_option("tabs_ex_open", shared.OptionInfo(
        True, 'Automatically show the first extension tab on start', section=section).needs_reload_ui())

def load_ui_settings():
    ln = 27

    with open(CSS, 'r') as FILE:
        styles = FILE.readlines()

    assert "color:" in styles[ln]
    c = getattr(shared.opts, 'tabs_ex_act_color', "greenyellow")
    styles[ln] = f"\t\t\tcolor: {c.strip().lower()};\n"

    with open(CSS, 'w') as FILE:
        FILE.writelines(styles)


script_callbacks.on_ui_settings(add_ui_settings)
script_callbacks.on_before_ui(load_ui_settings)
