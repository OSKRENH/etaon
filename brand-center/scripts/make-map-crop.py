#!/usr/bin/env python3
"""Делает из полной карты кадр для сайта и PDF-гайда.

assets/regions-map-full.svg — полная карта «как есть», её отдаёт кнопка
«Скачать карту». assets/regions-map.svg — тот же рисунок, но с viewBox по границам карты,
в котором вся карта целиком, с выделенными регионами (класс st1).
Запуск: python3 brand-center/scripts/make-map-crop.py
"""
import re
from pathlib import Path

ASSETS = Path(__file__).resolve().parents[1] / "assets"
FULL = ASSETS / "regions-map-full.svg"
CROP = ASSETS / "regions-map.svg"

# Кадр охватывает всю карту целиком: контуры лежат в x 331–3521, y -53–1924,
# запас по краям около 40 единиц. Пропорция ≈1.6.
VIEWBOX = "300 -90 3260 2040"


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
