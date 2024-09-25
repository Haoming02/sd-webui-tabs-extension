import modules.scripts as scripts
import gradio as gr
import os


CONFIG_FILE = os.path.join(scripts.basedir(), "tab_configs.csv")
DEFAULT_VALUE = "\n".join(
    [
        ",".join(["", "txt", "img"]),
        ",".join(["tabs", "left", "right"]),
        ",".join(["default", "left", "right"]),
    ]
)


class TabsEx(scripts.Script):

    def __init__(self):
        self.sorting_priority = 99999
        self.data: str = self._load_data()

    def title(self):
        return "Tabs Extension"

    def show(self, is_img2img):
        return None if is_img2img else scripts.AlwaysVisible

    def ui(self, is_img2img):
        if is_img2img:
            return None

        with gr.Column(visible=False):

            dummy = gr.Checkbox(
                label="Enable",
                elem_id="TABSEX_CHECKBOX",
                interactive=True,
            )

            label = gr.Textbox(
                label="[TabsExtension] Configs",
                elem_id="TABSEX_LBL",
                value=self.data,
            )

            btn = gr.Button(value="save", elem_id="TABSEX_BTN")
            btn.click(fn=self._write_data, inputs=[label], queue=False)

        [setattr(comp, "do_not_save_to_config", True) for comp in (dummy, label, btn)]
        return None

    def _load_data(self) -> str:
        if not os.path.isfile(CONFIG_FILE):
            return DEFAULT_VALUE
        with open(CONFIG_FILE, "r", encoding="utf-8", errors="ignore") as csv_file:
            return csv_file.read()

    def _write_data(self, data: str):
        try:
            if data.strip() != self.data.strip():
                print("\n[Tabs. Ex] Saving New Config...\n")
                with open(CONFIG_FILE, "w+", encoding="utf-8") as csv_file:
                    csv_file.write(data)
        except:
            raise gr.Error("[TabsExtension] Failed to save config...")
