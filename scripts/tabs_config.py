from modules import script_callbacks
import modules.scripts as scripts
import gradio as gr

CONFIG_FILE = scripts.basedir() + '/' + 'tab_configs.csv'

DEFAULT_VALUE = ',txt,img\ntabs,left,right\ndefault,left,right\n'

def write_data(data:str):
    with open(CONFIG_FILE, 'w') as csv_file:
        csv_file.write(data)

def load_data():
    try:
        with open(CONFIG_FILE, 'r') as csv_file:
            data = csv_file.read()
            return data

    except IOError:
        print('[Tabs. Ex] Creating Empty Config...')
        with open(CONFIG_FILE, 'w+') as csv_file:
            csv_file.write(DEFAULT_VALUE)
            return DEFAULT_VALUE

class TabsEx(scripts.Script):
    def title(self):
        return "Tabs Extension"

    def show(self, is_img2img):
        if is_img2img is True:
            return None

        return scripts.AlwaysVisible

    def ui(self, is_img2img):
        if is_img2img is True:
            return None

        data = load_data()

        label = gr.Textbox(value=data, elem_id='TABSEX_LB')
        btn = gr.Button(value='Save', elem_id='TABSEX_BT')

        btn.click(write_data, inputs=label)
        return None
