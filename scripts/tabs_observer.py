from modules.script_callbacks import on_after_component
from gradio.components import Component
from gradio import Checkbox


JS = "() => { TabsExtension.refreshEnableCheckbox(); }"


def observe(component: Component, **kwargs: dict):
    if not isinstance(component, Checkbox):
        return

    elem_id: str = kwargs.get("elem_id", None) or ""
    # InputAccordion
    if "-checkbox" in elem_id:
        component.change(fn=None, _js=JS)
        return

    label: str = (kwargs.get("label", None) or "").lower()
    if "enable" in label or "active" in label:
        component.change(fn=None, _js=JS)


on_after_component(observe)
