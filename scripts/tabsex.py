from modules import script_callbacks, shared
import gradio as gr

section = ('ui', "User interface")

def add_ui_settings():
    shared.opts.add_option("tabs_ex_delay", shared.OptionInfo(
        10, "Delay (ms) before moving the Extensions", gr.Slider, {"minimum": 10, "maximum": 1000, "step": 90}, section=section).needs_reload_ui())
    shared.opts.add_option("tabs_ex_forge", shared.OptionInfo(
        False, 'Hide the "Integrated" text', section=section).info('for SD-Webui-Forge').needs_reload_ui())

script_callbacks.on_ui_settings(add_ui_settings)
