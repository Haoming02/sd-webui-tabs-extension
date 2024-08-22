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


def write_data(data: str):
    with open(CONFIG_FILE, "w", encoding="utf-8") as csv_file:
        csv_file.write(data)


def load_data() -> str:
    if os.path.isfile(CONFIG_FILE):
        with open(CONFIG_FILE, "r", encoding="utf-8", errors="replace") as csv_file:
            data = csv_file.read()
        return data

    else:
        print("\n[Tabs. Ex] Creating Empty Config...\n")
        with open(CONFIG_FILE, "w+") as csv_file:
            csv_file.write(DEFAULT_VALUE)
        return DEFAULT_VALUE


def js() -> dict:
    if int(str(gr.__version__).split(".")[0]) == 4:
        return {"js": "() => { TabsExtensionConfigs.onSave(); }"}
    else:
        return {"_js": "() => { TabsExtensionConfigs.onSave(); }"}


class TabsEx(scripts.Script):

    def title(self):
        return "Tabs Extension"

    def show(self, is_img2img):
        return None if is_img2img else scripts.AlwaysVisible

    def ui(self, is_img2img):
        if is_img2img:
            return None

        label = gr.Textbox(
            label="[TabsExtension] Configs",
            info="If this textbox does not disappear after a while, it means the Extension failed to process correctly... Please open an Issue on GitHub with the list of Extensions installed.",
            value=load_data(),
            elem_id="TABSEX_LBL",
        )
        label.do_not_save_to_config = True

        btn = gr.Button(value="save", elem_id="TABSEX_BTN")
        btn.do_not_save_to_config = True

        btn.click(write_data, label).success(None, **js())
        return None
