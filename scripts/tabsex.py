from modules import script_callbacks, shared
import gradio as gr

section = ('ui', "User interface")

def add_ui_settings():
    shared.opts.add_option("tabs_ex_delay", shared.OptionInfo(
        10, "Delay (ms) before moving the Contents", gr.Slider, {"minimum": 10, "maximum": 500, "step": 10}, section=section).needs_reload_ui())

    shared.opts.add_option("tabs_ex_move_t2i_btn", shared.OptionInfo(
        False, 'Move txt2img Tabs Buttons under Generation Result', section=section).needs_reload_ui())

script_callbacks.on_ui_settings(add_ui_settings)
