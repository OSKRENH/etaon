#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import subprocess
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
LOGOS = ROOT / "assets" / "logos"


def query_number(svg: Path, option: str) -> float:
    result = subprocess.run(
        ["inkscape", str(svg), option],
        check=True,
        capture_output=True,
        text=True,
    )
    lines = [line.strip() for line in result.stdout.splitlines() if line.strip()]
    if not lines:
        raise RuntimeError(f"Inkscape did not return {option} for {svg.name}")
    return float(lines[-1])


def format_number(value: float) -> str:
    return f"{value:.6f}".rstrip("0").rstrip(".")


def crop(svg: Path) -> None:
    x = query_number(svg, "--query-x")
    y = query_number(svg, "--query-y")
    width = query_number(svg, "--query-width")
    height = query_number(svg, "--query-height")
    if width <= 0 or height <= 0:
        raise RuntimeError(f"Empty drawing: {svg.name}")

    tree = ET.parse(svg)
    root = tree.getroot()
    if root.tag.startswith("{"):
        namespace = root.tag.split("}", 1)[0][1:]
        ET.register_namespace("", namespace)

    root.set(
        "viewBox",
        " ".join(format_number(value) for value in (x, y, width, height)),
    )
    root.set("width", format_number(width))
    root.set("height", format_number(height))
    tree.write(svg, encoding="utf-8", xml_declaration=True)

    print(f"Cropped {svg.name}: {format_number(width)} × {format_number(height)}")


files = sorted(LOGOS.glob("*.svg"))
if not files:
    raise SystemExit("No generated logo SVGs found")

for file in files:
    crop(file)

for file in files:
    text = file.read_text(encoding="utf-8")
    if 'viewBox="0 0 300 200"' in text:
        raise SystemExit(f"Uncropped artboard remains in {file.name}")
