from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOWNLOADS = ROOT / "downloads"
OUTPUT = DOWNLOADS / "downloads-manifest.json"

FILES = {
    "Etalon_Brand_Guide_2025.pdf": "PDF",
    "Etalon_Logos_All_Formats.zip": "ZIP · SVG, PNG, EPS, PDF",
    "Etalon_Symbol_All_Formats.zip": "ZIP · SVG, PNG, EPS, PDF",
    "Etalon_Map_All_Formats.zip": "ZIP · SVG, PNG, EPS, PDF",
    "Gilroy.zip": "ZIP · TTF",
}

manifest: dict[str, dict[str, int | str]] = {}
for filename, format_label in FILES.items():
    path = DOWNLOADS / filename
    if not path.is_file() or path.stat().st_size <= 0:
        raise FileNotFoundError(f"Download file is missing or empty: {path}")
    manifest[filename] = {
        "format": format_label,
        "bytes": path.stat().st_size,
    }

OUTPUT.write_text(
    json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)
print(f"Download manifest generated: {OUTPUT}")
