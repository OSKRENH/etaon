import xml.etree.ElementTree as ET
from pathlib import Path

SVG_NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", SVG_NS)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "logos"
OUTPUT.mkdir(parents=True, exist_ok=True)

SOURCES = {
    "group": ROOT / "assets" / "group-etalon.svg",
    "ru": ROOT / "assets" / "etalon-ru.svg",
    "en": ROOT / "assets" / "etalon-en.svg",
    "symbol": ROOT / "assets" / "symbol-etalon.svg",
}

COLORS = {
    "blue": "#223E90",
    "white": "#FFFFFF",
    "black": "#1D1D1B",
}

for key, source in SOURCES.items():
    text = source.read_text(encoding="utf-8")
    for tone, color in COLORS.items():
        variant = text.replace("#223e90", color).replace("#223E90", color)
        (OUTPUT / f"{key}-{tone}.svg").write_text(variant, encoding="utf-8")


def group_without_descriptor(source: Path) -> str:
    """Групповой логотип без дескриптора «ГРУППА».

    В мастере слово «ЭТАЛОН» — первый элемент основной группы, всё остальное в ней —
    дескриптор. Файл строится из того же мастера, что и встроенный в страницу SVG,
    поэтому форма букв совпадает с тем, что пользователь видит на экране.
    """
    root = ET.parse(source).getroot()
    main = next(el for el in root if el.tag == f"{{{SVG_NS}}}g")
    children = list(main)
    if len(children) < 2:
        raise RuntimeError(f"Unexpected structure of {source.name}: no descriptor to remove")
    for extra in children[1:]:
        main.remove(extra)
    return ET.tostring(root, encoding="unicode")


without_descriptor = group_without_descriptor(SOURCES["group"])
for tone, color in COLORS.items():
    variant = without_descriptor.replace("#223e90", color).replace("#223E90", color)
    (OUTPUT / f"group-nodesc-{tone}.svg").write_text(variant, encoding="utf-8")
