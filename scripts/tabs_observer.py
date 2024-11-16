from modules.script_callbacks import on_after_component
from gradio import __version__ as gr_version
from gradio.components import Component
from gradio import Checkbox


is_gradio_4: bool = int(str(gr_version).split(".", 1)[0]) == 4


def js() -> dict:
    if is_gradio_4:
        return {"js": "() => { TabsExtension.refreshEnableCheckbox(); }"}
    else:
        return {"_js": "() => { TabsExtension.refreshEnableCheckbox(); }"}


def observe(component: Component, **kwargs: dict):
    if not isinstance(component, Checkbox):
        return

    elem_id: str = kwargs.get("elem_id", None) or ""
    # InputAccordion
    if "-checkbox" in elem_id:
        component.input(fn=None, **js())
        return

    label: str = (kwargs.get("label", None) or "").lower()
    if "enable" in label or "active" in label:
        component.input(fn=None, **js())


on_after_component(observe)
