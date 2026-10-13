#!/usr/bin/env python3
"""Собирает файлы палитры для архива «Цвета».

Единственный источник цветов — вызовы colorCard({...}) в app.js, из них же
рисуется палитра на сайте. Скрипт читает их оттуда и делает:
  Cards/Etalon_Color_<имя>.svg — карточка каждого цвета, как на сайте;
  Etalon_Palette.svg           — вся палитра одним листом;
  Etalon_Palette.ase           — образцы для Adobe (Photoshop, Illustrator, InDesign);
  Etalon_Palette.css / .json   — значения для разработки;
  README.txt.
PNG и PDF из SVG делает build-download-archives.sh через Inkscape.
Использование: build-color-assets.py <выходная папка>
"""
from __future__ import annotations

import json
import re
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INK = "#1E242E"
WHITE = "#FFFFFF"

SLUGS = {
    "Фирменный синий": "Brand_Blue",
    "Графитовый": "Graphite",
    "Синий 50%": "Blue_50",
    "Синий 15%": "Blue_15",
    "Акцент": "Accent",
}
CSS_NAMES = {
    "Фирменный синий": "brand-blue",
    "Графитовый": "graphite",
    "Синий 50%": "blue-50",
    "Синий 15%": "blue-15",
    "Акцент": "accent",
}


def read_colors() -> list[dict[str, str]]:
    text = (ROOT / "app.js").read_text(encoding="utf-8")
    colors = []
    for call in re.findall(r"colorCard\(\{(.*?)\}\)", text):
        item = dict(re.findall(r"(\w+):\s*'([^']*)'", call))
        if {"name", "hex", "rgb", "cmyk"} <= item.keys():
            colors.append(item)
    if len(colors) != len(SLUGS) or {c["name"] for c in colors} != set(SLUGS):
        raise SystemExit(f"В app.js ожидалось {len(SLUGS)} цветов палитры, найдено {len(colors)}")
    return colors


def luminance(hex_value: str) -> float:
    channels = [int(hex_value[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    lin = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in channels]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def text_color(background: str) -> str:
    """Тот же выбор, что на сайте: из двух цветов бренда берётся более контрастный."""
    def contrast(a: str, b: str) -> float:
        hi, lo = sorted((luminance(a), luminance(b)), reverse=True)
        return (hi + 0.05) / (lo + 0.05)
    return WHITE if contrast(background, WHITE) >= contrast(background, INK) else INK


def card(color: dict[str, str], x: float, y: float, w: float, h: float) -> str:
    fg = text_color(color["hex"])
    rows = [("RGB", color["rgb"]), ("CMYK", color["cmyk"])]
    if color.get("pantone"):
        rows.append(("Pantone", color["pantone"]))
    if color.get("ral"):
        rows.append(("RAL", color["ral"]))
    pad = 36
    out = [
        f'<g transform="translate({x:g} {y:g})" font-family="Gilroy, Arial, sans-serif" fill="{fg}">',
        f'<rect width="{w:g}" height="{h:g}" rx="24" fill="{color["hex"]}"/>',
        f'<text x="{pad}" y="{pad + 22}" font-size="22" font-weight="500">{color["name"]}</text>',
        f'<text x="{pad}" y="{pad + 22 + 54}" font-size="44" font-weight="500">{color["hex"]}</text>',
    ]
    line_h = 34
    top = h - pad - line_h * (len(rows) - 1) - 6
    for i, (label, value) in enumerate(rows):
        yy = top + i * line_h
        out.append(f'<line x1="{pad}" x2="{w - pad:g}" y1="{yy - 24:g}" y2="{yy - 24:g}" stroke="{fg}" stroke-opacity=".35"/>')
        out.append(f'<text x="{pad}" y="{yy:g}" font-size="18" fill-opacity=".8">{label}</text>')
        out.append(f'<text x="{w - pad:g}" y="{yy:g}" font-size="18" text-anchor="end">{value}</text>')
    out.append("</g>")
    return "\n".join(out)


def svg(width: float, height: float, body: str, title: str) -> str:
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width:g}" height="{height:g}" '
        f'viewBox="0 0 {width:g} {height:g}">\n<title>{title}</title>\n{body}\n</svg>\n'
    )


def palette_sheet(colors: list[dict[str, str]]) -> str:
    gap = 16
    total_w = 1800
    row_h = 440
    by_name = {c["name"]: c for c in colors}
    main, dark = by_name["Фирменный синий"], by_name["Графитовый"]
    rest = [by_name["Синий 50%"], by_name["Синий 15%"], by_name["Акцент"]]
    main_w = (total_w - gap) * 2 / 3
    dark_w = total_w - gap - main_w
    small_w = (total_w - 2 * gap) / 3
    parts = [card(main, 0, 0, main_w, row_h), card(dark, main_w + gap, 0, dark_w, row_h)]
    for i, c in enumerate(rest):
        parts.append(card(c, i * (small_w + gap), row_h + gap, small_w, row_h))
    return svg(total_w, row_h * 2 + gap, "\n".join(parts), "Палитра Группы «Эталон»")


def ase_bytes(colors: list[dict[str, str]]) -> bytes:
    """Adobe Swatch Exchange: RGB-образцы в порядке палитры."""
    blocks = []
    for c in colors:
        name = (c["name"] + "\0").encode("utf-16-be")
        rgb = [int(c["hex"][i:i + 2], 16) / 255 for i in (1, 3, 5)]
        body = struct.pack(">H", len(name) // 2) + name + b"RGB " + struct.pack(">3f", *rgb) + struct.pack(">H", 2)
        blocks.append(struct.pack(">HI", 0x0001, len(body)) + body)
    return b"ASEF" + struct.pack(">HHI", 1, 0, len(blocks)) + b"".join(blocks)


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    out = Path(sys.argv[1])
    cards_dir = out / "Cards"
    cards_dir.mkdir(parents=True, exist_ok=True)
    colors = read_colors()

    for c in colors:
        w, h = 600, 380
        (cards_dir / f"Etalon_Color_{SLUGS[c['name']]}.svg").write_text(
            svg(w, h, card(c, 0, 0, w, h), c["name"]), encoding="utf-8")
    (out / "Etalon_Palette.svg").write_text(palette_sheet(colors), encoding="utf-8")
    (out / "Etalon_Palette.ase").write_bytes(ase_bytes(colors))

    css = ":root {\n" + "".join(
        f"  --etalon-{CSS_NAMES[c['name']]}: {c['hex']};\n" for c in colors) + "}\n"
    (out / "Etalon_Palette.css").write_text(css, encoding="utf-8")
    (out / "Etalon_Palette.json").write_text(
        json.dumps({CSS_NAMES[c["name"]]: {k: v for k, v in c.items() if k not in ("className",)} for c in colors},
                   ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (out / "README.txt").write_text(
        "Палитра Группы «Эталон».\n\n"
        "Cards/ — карточка каждого цвета (SVG, PNG, PDF) с кодами HEX, RGB, CMYK, Pantone и RAL.\n"
        "Etalon_Palette — вся палитра одним листом (SVG, PNG, PDF).\n"
        "Etalon_Palette.ase — образцы для Adobe Photoshop, Illustrator и InDesign.\n"
        "Etalon_Palette.css и .json — значения для разработки.\n\n"
        "Фирменный синий #223E90 — основной цвет. Оранжевый используется только как акцент.\n"
        "Не изменяйте фирменные цвета.\n", encoding="utf-8")
    print(f"Файлы палитры: {out}")


if __name__ == "__main__":
    main()
