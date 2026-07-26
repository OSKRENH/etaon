#!/usr/bin/env bash
set -euo pipefail

mkdir -p brand-center/assets/logos brand-center/downloads

rm -f brand-center/downloads/Gilroy.zip
(
  cd brand-center/fonts
  zip -q ../downloads/Gilroy.zip ./*.ttf
)
unzip -t brand-center/downloads/Gilroy.zip >/dev/null

# Keep the brand guide on the Etalon domain. Reuse the deployed copy on
# subsequent builds; the Adobe link is only a one-time migration fallback.
GUIDE_PATH="brand-center/downloads/Etalon_Brand_Guide_2025.pdf"
rm -f "$GUIDE_PATH"
if ! curl --fail --location --retry 2 --retry-delay 2 \
  "https://etaon.ivankamaldinov.workers.dev/downloads/Etalon_Brand_Guide_2025.pdf" \
  --output "$GUIDE_PATH"; then
  curl --fail --location --retry 3 --retry-delay 2 \
    "https://at.adobe.com/lZLADQ8R3LwRgx5x" \
    --output "$GUIDE_PATH"
fi
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
