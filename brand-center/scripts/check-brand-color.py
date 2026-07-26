#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCE_FILES = [
    ROOT / "assets" / "group-etalon.svg",
    ROOT / "assets" / "etalon-ru.svg",
    ROOT / "assets" / "etalon-en.svg",
    ROOT / "assets" / "symbol-etalon.svg",
]


def normalize(hex_color: str) -> str:
    return hex_color.upper()


def tint(hex_color: str, ratio: float) -> str:
    rgb = [int(hex_color[index:index + 2], 16) for index in (1, 3, 5)]
    mixed = [round(channel * ratio + 255 * (1 - ratio)) for channel in rgb]
    return "#" + "".join(f"{channel:02X}" for channel in mixed)


errors: list[str] = []
source_colors: dict[Path, set[str]] = {}
for path in SOURCE_FILES:
    text = path.read_text(encoding="utf-8")
    source_colors[path] = {normalize(value) for value in re.findall(r"#[0-9a-fA-F]{6}", text)}

reference = normalize(re.search(r"#[0-9a-fA-F]{6}", (ROOT / "assets" / "etalon-ru.svg").read_text(encoding="utf-8")).group(0))
for path, colors in source_colors.items():
    if reference not in colors:
        errors.append(f"{path.name}: отсутствует общий фирменный цвет {reference}; найдены {sorted(colors)}")

expected_50 = tint(reference, 0.50)
expected_15 = tint(reference, 0.15)
app = (ROOT / "app.js").read_text(encoding="utf-8")
guide = (ROOT / "scripts" / "build-brand-guide.py").read_text(encoding="utf-8")
generator = (ROOT / "scripts" / "generate-logo-variants.py").read_text(encoding="utf-8")

checks = [
    (reference in app, f"app.js не содержит фирменный цвет {reference}"),
    (expected_50 in app, f"app.js не содержит 50% оттенок {expected_50}"),
    (expected_15 in app, f"app.js не содержит 15% оттенок {expected_15}"),
    (reference.lower() in guide.lower(), f"PDF-гайд не содержит фирменный цвет {reference}"),
    (expected_50.lower() in guide.lower(), f"PDF-гайд не содержит 50% оттенок {expected_50}"),
    (expected_15.lower() in guide.lower(), f"PDF-гайд не содержит 15% оттенок {expected_15}"),
    (reference in generator, f"генератор логотипов не использует {reference}"),
]
for ok, message in checks:
    if not ok:
        errors.append(message)

if errors:
    print("Несоответствия фирменного цвета:", file=sys.stderr)
    for error in errors:
        print(f"  - {error}", file=sys.stderr)
    raise SystemExit(1)

print(f"Фирменный цвет совпадает во всех мастер-файлах: {reference}")
print(f"Производные оттенки: 50% {expected_50}, 15% {expected_15}")
