#!/usr/bin/env python3
"""Делает из полной карты кадр для сайта и PDF-гайда.

assets/regions-map-full.svg — полная карта «как есть», её отдаёт кнопка
«Скачать карту». assets/regions-map.svg — тот же рисунок, но с viewBox 16:9,
в котором целиком видны все выделенные регионы (класс st1).
Запуск: python3 brand-center/scripts/make-map-crop.py
"""
import re
from pathlib import Path

ASSETS = Path(__file__).resolve().parents[1] / "assets"
FULL = ASSETS / "regions-map-full.svg"
CROP = ASSETS / "regions-map.svg"

# Кадр 16:9: выделенные регионы лежат в x 331–2707, y 1262–1780,
# запас с боков даёт контекст, снизу карта заканчивается около y 1924.
VIEWBOX = "150 500 2700 1519"


def make_crop(source: str) -> str:
    out = re.sub(r"<\?xml[^>]*\?>\s*", "", source)
    out = re.sub(r"<!--.*?-->", "", out, flags=re.S)
    out = re.sub(r">\s+<", "><", out).strip()
    out, count = re.subn(r'viewBox="[^"]*"', f'viewBox="{VIEWBOX}"', out, count=1)
    if count != 1:
        raise SystemExit("В карте не найден viewBox")
    return out + "\n"


if __name__ == "__main__":
    CROP.write_text(make_crop(FULL.read_text(encoding="utf-8")), encoding="utf-8")
    print(f"{CROP.name}: {CROP.stat().st_size} байт, viewBox {VIEWBOX}")
