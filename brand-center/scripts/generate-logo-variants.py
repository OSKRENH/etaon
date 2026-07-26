from pathlib import Path

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
