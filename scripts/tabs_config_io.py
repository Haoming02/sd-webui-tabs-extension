from modules.shared import opts
from modules import scripts
import gradio as gr
import os.path


CONFIG_FILE = os.path.join(scripts.basedir(), "tab_configs.csv")


class TabsEx(scripts.Script):
    sorting_priority = 8192
    data: str = None

    s_toggles: list[gr.components.Component] = None
    t2i_done: bool = False

    def __init__(self):
        if TabsEx.data is None:
            TabsEx.data = TabsEx._load_data()

    def title(self):
        return "Tabs Extension"

    def show(self, is_img2img):
        return None if is_img2img else scripts.AlwaysVisible

    def ui(self, is_img2img):
        if is_img2img:
            return None

        if getattr(opts, "tabs_ex_scripts_toggle", False):
            with gr.Group(visible=False):
                TabsEx.s_toggles = [
                    gr.Button("T", elem_id="TABSEX_txt2img_s_toggle", interactive=True),
                    gr.State(value="None"),
                    gr.Button("T", elem_id="TABSEX_img2img_s_toggle", interactive=True),
                    gr.State(value="None"),
                ]

            for comp in TabsEx.s_toggles:
                comp.do_not_save_to_config = True

        with gr.Column(visible=False):
            dummy = gr.Checkbox(
                label="Enable",
                elem_id="TABSEX_CHECKBOX",
                interactive=True,
            )
            label = gr.Textbox(
                label="[TabsExtension] Configs",
                elem_id="TABSEX_LBL",
                value=TabsEx.data,
            )

            btn = gr.Button(value="save", elem_id="TABSEX_BTN")
            btn.click(fn=self._write_data, inputs=[label], queue=False)

        [setattr(comp, "do_not_save_to_config", True) for comp in (dummy, label, btn)]
        return None

    @staticmethod
    def _load_data() -> str:
        if not os.path.isfile(CONFIG_FILE):
            return "\n".join(
                [
                    ",".join(["", "txt", "img"]),
                    ",".join(["tabs", "left", "right"]),
                    ",".join(["default", "left", "right"]),
                ]
            )

        with open(CONFIG_FILE, "r", encoding="utf-8", errors="ignore") as csv_file:
            return csv_file.read()

    def _write_data(self, data: str):
        try:
            if data.strip() != TabsEx.data.strip():
                print("\n[TabsExtension] Saving New Config...\n")
                with open(CONFIG_FILE, "w+", encoding="utf-8") as csv_file:
                    csv_file.write(data)
        except Exception:
            raise gr.Error("[TabsExtension] Failed to save config...")


if getattr(opts, "tabs_ex_scripts_toggle", False):
    from modules.script_callbacks import on_after_component

    def after_component(component, **kwargs):
        if kwargs.get("elem_id", None) != "script_list":
            return

        assert isinstance(component, gr.Dropdown)

        if TabsEx.t2i_done is True:
            btn, c = TabsEx.s_toggles[2:4]
            ss: list = scripts.scripts_img2img.selectable_scripts
        else:
            btn, c = TabsEx.s_toggles[0:2]
            ss: list = scripts.scripts_txt2img.selectable_scripts
            TabsEx.t2i_done = True

        def _toggle(current: int, cache: str):
            if not current or current == "None":
                _a: str = cache
                _b: str = "None"
            else:
                _a: str = "None"
                _b: str = ss[current - 1].title()
            return [_a, _b]

        btn.click(
            fn=_toggle,
            inputs=[component, c],
            outputs=[component, c],
            show_progress="hidden",
        )

    on_after_component(after_component)
