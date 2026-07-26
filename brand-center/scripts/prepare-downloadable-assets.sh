#!/usr/bin/env bash
set -euo pipefail

mkdir -p brand-center/assets/logos brand-center/downloads

rm -f brand-center/downloads/Gilroy.zip
(
  cd brand-center/fonts
  zip -q ../downloads/Gilroy.zip ./*.ttf
)
unzip -t brand-center/downloads/Gilroy.zip >/dev/null

python3 brand-center/scripts/generate-logo-variants.py

# Restore the clean SVG from the archive already hosted on the Etalon domain.
# No Adobe link or authentication is involved.
curl --fail --location --retry 3 --retry-delay 2 \
  "https://etaon.ivankamaldinov.workers.dev/downloads/Etalon_Map_All_Formats.zip" \
  --output /tmp/etalon-map-source.zip
unzip -p /tmp/etalon-map-source.zip \
  "Etalon_Map_All_Formats/Etalon_Map.svg" \
  > brand-center/assets/regions-map.svg
cp brand-center/assets/regions-map.svg brand-center/assets/regions-map-hero.svg
test -s brand-center/assets/regions-map.svg

chmod +x brand-center/scripts/build-download-archives.sh
brand-center/scripts/build-download-archives.sh brand-center

# Generate the guide entirely from local brand-center content and assets.
GUIDE_PATH="brand-center/downloads/Etalon_Brand_Guide_2025.pdf"
rm -f "$GUIDE_PATH"
python3 brand-center/scripts/build-brand-guide.py
test -s "$GUIDE_PATH"
pdfinfo "$GUIDE_PATH" | grep -Eq '^Pages:[[:space:]]+6$'

test -s brand-center/downloads/Gilroy.zip
test -s brand-center/downloads/Etalon_Logos_All_Formats.zip
test -s brand-center/downloads/Etalon_Symbol_All_Formats.zip
test -s brand-center/downloads/Etalon_Map_All_Formats.zip

unzip -t brand-center/downloads/Etalon_Logos_All_Formats.zip >/dev/null
unzip -t brand-center/downloads/Etalon_Symbol_All_Formats.zip >/dev/null
unzip -t brand-center/downloads/Etalon_Map_All_Formats.zip >/dev/null

ls -lh brand-center/downloads/*
