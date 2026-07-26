from pathlib import Path
import xml.etree.ElementTree as ET

ET.register_namespace("", "http://www.w3.org/2000/svg")

source = Path("/tmp/regions-map-raw.svg")
target = Path("brand-center/assets/regions-map.svg")
hero_target = Path("brand-center/assets/regions-map-hero.svg")

tree = ET.parse(source)
root = tree.getroot()

for parent in root.iter():
    for child in list(parent):
        tag = child.tag.rsplit("}", 1)[-1]
        fill = child.attrib.get("fill", "")
        if tag == "rect" or (tag == "path" and fill == "rgb(100%, 100%, 100%)"):
            parent.remove(child)
            continue
        if fill == "rgb(95.999146%, 95.999146%, 97.999573%)":
            child.set("fill", "#F5F5FA")
        elif fill == "rgb(12.998962%, 23.999023%, 55.999756%)":
            child.set("fill", "#223E90")
        for attr in (
            "stroke",
            "stroke-opacity",
            "stroke-width",
            "stroke-linecap",
            "stroke-linejoin",
            "stroke-miterlimit",
            "fill-opacity",
        ):
            child.attrib.pop(attr, None)

root.set("width", "1920")
root.set("height", "1080")
root.set("viewBox", "0 0 1440 810")
tree.write(target, encoding="utf-8", xml_declaration=True)

hero_tree = ET.parse(target)
hero_root = hero_tree.getroot()
for path in hero_root.iter():
    if path.tag.rsplit("}", 1)[-1] != "path":
        continue
    fill = path.attrib.get("fill")
    path.set("fill", "#FFFFFF")
    path.set("fill-opacity", ".08" if fill == "#F5F5FA" else ".22")
hero_tree.write(hero_target, encoding="utf-8", xml_declaration=True)
