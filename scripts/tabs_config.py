import modules.scripts as scripts
import gradio as gr
import os


CONFIG_FILE = os.path.join(scripts.basedir(), "tab_configs.csv")


def write_data(data: str):
    with open(CONFIG_FILE, "w", encoding="utf-8") as csv_file:
        csv_file.write(data)


def load_data():
    try:
        with open(CONFIG_FILE, "r", encoding="utf-8") as csv_file:
            data = csv_file.read()
            return data

    except IOError:
        print("[Tabs. Ex] Creating Empty Config...")
        DEFAULT_VALUE = "\n".join([",txt,img", "tabs,left,right", "default,left,right"])

        with open(CONFIG_FILE, "w+") as csv_file:
            csv_file.write(DEFAULT_VALUE)
            return DEFAULT_VALUE


data = load_data()


class TabsEx(scripts.Script):
    def title(self):
        return "Tabs Extension"

    def show(self, is_img2img):
        return None if is_img2img else scripts.AlwaysVisible

    def ui(self, is_img2img):
        if is_img2img is True:
            return None

        global data
        label = gr.Textbox(value=data, elem_id="TABSEX_LB")
        label.do_not_save_to_config = True

        btn = gr.Button(value="Save", elem_id="TABSEX_BT")
        btn.click(write_data, inputs=label)
        return None
