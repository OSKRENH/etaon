#!/usr/bin/env python3
"""Проверяет готовые файлы скачивания, которые лежат в репозитории.

CI их не собирает: после правки логотипов, карты, цветов или шрифта
их пересобирают локально скриптом prepare-downloadable-assets.sh.
"""
from __future__ import annotations

import json
from pathlib import Path
import subprocess
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DOWNLOADS = ROOT / "downloads"
ARCHIVES = [
    "Etalon_Brand_Kit.zip",
    "Etalon_Logos_All_Formats.zip",
    "Etalon_Symbol_All_Formats.zip",
    "Etalon_Colors_All_Formats.zip",
    "Etalon_Map_All_Formats.zip",
    "Gilroy.zip",
]
GENERATED = [
    ROOT / "assets" / "regions-map-hero.svg",
    *(ROOT / "assets" / "logos" / f"{name}-{tone}.svg"
      for name in ("group", "group-nodesc", "ru", "en", "symbol")
      for tone in ("blue", "white", "black")),
]

errors: list[str] = []

subprocess.run([sys.executable, str(ROOT / "scripts" / "check-brand-color.py")], check=True)

manifest = json.loads((DOWNLOADS / "downloads-manifest.json").read_text(encoding="utf-8"))
for name in ARCHIVES:
    path = DOWNLOADS / name
    if not path.is_file() or path.stat().st_size == 0:
        errors.append(f"нет файла {path.relative_to(ROOT)}")
        continue
    with zipfile.ZipFile(path) as archive:
        broken = archive.testzip()
        if broken:
            errors.append(f"{name}: повреждён {broken}")
    expected = manifest.get(name, {}).get("bytes")
    if expected != path.stat().st_size:
        errors.append(f"{name}: в манифесте {expected} байт, файл {path.stat().st_size}")

with zipfile.ZipFile(DOWNLOADS / "Gilroy.zip") as archive:
    zipped = {Path(n).name: archive.read(n) for n in archive.namelist() if n.endswith(".ttf")}
for font in sorted((ROOT / "fonts").glob("*.ttf")):
    if zipped.get(font.name) != font.read_bytes():
        errors.append(f"Gilroy.zip не совпадает с fonts/{font.name}")

for path in GENERATED:
    if not path.is_file() or path.stat().st_size == 0:
        errors.append(f"нет файла {path.relative_to(ROOT)}")

if errors:
    print("Готовые файлы скачивания не в порядке. Пересоберите их локально:", file=sys.stderr)
    print("  brand-center/scripts/prepare-downloadable-assets.sh", file=sys.stderr)
    for error in errors:
        print(f"- {error}", file=sys.stderr)
    sys.exit(1)

for name in ARCHIVES:
    print(f"{name}: {(DOWNLOADS / name).stat().st_size} байт, совпадает с манифестом")
