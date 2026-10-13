from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOWNLOADS = ROOT / "downloads"
OUTPUT = DOWNLOADS / "downloads-manifest.json"

FILES = {
    "Etalon_Brand_Kit.zip": "ZIP · всё сразу",
    "Etalon_Logos_All_Formats.zip": "ZIP · SVG, PNG, EPS, PDF",
    "Etalon_Symbol_All_Formats.zip": "ZIP · SVG, PNG, EPS, PDF",
    "Etalon_Colors_All_Formats.zip": "ZIP · SVG, PNG, PDF, ASE, CSS",
    "Etalon_Map_All_Formats.zip": "ZIP · SVG, PNG, EPS, PDF",
    "Gilroy.zip": "ZIP · TTF",
}

def build_date() -> str:
    """Дата сборки в ISO (UTC).

    SOURCE_DATE_EPOCH уважается, чтобы сборка оставалась воспроизводимой.
    """
    epoch = os.environ.get("SOURCE_DATE_EPOCH")
    if epoch and epoch.strip().isdigit():
        moment = datetime.fromtimestamp(int(epoch), tz=timezone.utc)
    else:
        moment = datetime.now(tz=timezone.utc)
    return moment.date().isoformat()


manifest: dict[str, object] = {"_builtAt": build_date()}
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
