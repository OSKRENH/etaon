#!/usr/bin/env bash
set -euo pipefail

mkdir -p brand-center/assets/logos brand-center/downloads

rm -f brand-center/downloads/Gilroy.zip
(
  cd brand-center/fonts
  zip -q ../downloads/Gilroy.zip ./*.ttf
)
unzip -t brand-center/downloads/Gilroy.zip >/dev/null

# The official guide is stored directly in the repository and served from
# the Etalon site. No Adobe login, redirect or external host is required.
GUIDE_PATH="brand-center/downloads/Etalon_Brand_Guide_2025.pdf"
test -s "$GUIDE_PATH"
pdfinfo "$GUIDE_PATH" | grep -Eq '^Pages:[[:space:]]+28$'

python3 brand-center/scripts/generate-logo-variants.py

curl --fail --location --retry 3 --retry-delay 2 \
  "https://at.adobe.com/VA69j7Ri7AZ0TPBo" \
  --output /tmp/regions-map.pdf
pdftocairo -svg /tmp/regions-map.pdf /tmp/regions-map-raw.svg
python3 brand-center/scripts/prepare-map.py

chmod +x brand-center/scripts/build-download-archives.sh
brand-center/scripts/build-download-archives.sh brand-center

test -s brand-center/assets/regions-map.svg
test -s brand-center/downloads/Gilroy.zip
test -s "$GUIDE_PATH"
test -s brand-center/downloads/Etalon_Logos_All_Formats.zip
test -s brand-center/downloads/Etalon_Symbol_All_Formats.zip
test -s brand-center/downloads/Etalon_Map_All_Formats.zip

unzip -t brand-center/downloads/Etalon_Logos_All_Formats.zip >/dev/null
unzip -t brand-center/downloads/Etalon_Symbol_All_Formats.zip >/dev/null
unzip -t brand-center/downloads/Etalon_Map_All_Formats.zip >/dev/null

ls -lh brand-center/downloads/*
