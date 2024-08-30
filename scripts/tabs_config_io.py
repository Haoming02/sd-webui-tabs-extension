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
        self.data: str = self.load_data()

    def title(self):
        return "Tabs Extension"

    def show(self, is_img2img):
        return None if is_img2img else scripts.AlwaysVisible

    def ui(self, is_img2img):
        if is_img2img:
            return None

        dummy = gr.Checkbox(
            label="Enable", interactive=True, visible=True, elem_id="TABSEX_CHECKBOX"
        )

        label = gr.Textbox(
            label="[TabsExtension] Configs",
            info="If this textbox does not disappear after a while (based on Delay setting), it means the Extension failed to process correctly... Please open an Issue on GitHub with the list of Extensions installed, along with any errors in the console.",
            value=self.data,
            elem_id="TABSEX_LBL",
            visible=True,
        )

        btn = gr.Button(value="save", visible=False, elem_id="TABSEX_BTN")
        btn.click(fn=self.write_data, inputs=[label], outputs=None).success(
            fn=self.hide, inputs=None, outputs=[dummy, label]
        )

        [setattr(comp, "do_not_save_to_config", True) for comp in (dummy, label, btn)]
        return None

    def load_data(self) -> str:
        if os.path.isfile(CONFIG_FILE):
            with open(CONFIG_FILE, "r", encoding="utf-8", errors="replace") as csv_file:
                data = csv_file.read()
            return data

        else:
            print("\n[Tabs. Ex] Creating Empty Config...\n")
            with open(CONFIG_FILE, "w+") as csv_file:
                csv_file.write(DEFAULT_VALUE)
            return DEFAULT_VALUE

    def write_data(self, data: str):
        if data.strip() == self.data.strip():
            return

        with open(CONFIG_FILE, "w", encoding="utf-8") as csv_file:
            csv_file.write(data)

    def hide(self) -> list:
        return [gr.update(visible=False), gr.update(visible=False)]
