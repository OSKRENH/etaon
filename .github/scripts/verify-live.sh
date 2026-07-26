#!/usr/bin/env bash
set -euo pipefail

SITE_URL="${SITE_URL:?SITE_URL is required}"
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

fetch_with_retry() {
  local url="$1"
  local output="$2"
  local attempt

  echo "Проверяю: $url"
  for attempt in $(seq 1 10); do
    if curl -fsSL --connect-timeout 15 --max-time 90 "$url" -o "$output"; then
      return 0
    fi
    echo "Попытка $attempt не удалась, повтор через 3 секунды..."
    sleep 3
  done

  echo "Не удалось скачать после 10 попыток: $url" >&2
  return 1
}

fetch_matching_file() {
  local local_file="$1"
  local url="$2"
  local output="$3"
  local expected actual attempt

  expected=$(sha256sum "$local_file" | awk '{print $1}')
  echo "Проверяю: $url"

  for attempt in $(seq 1 12); do
    if curl -fsSL --connect-timeout 15 --max-time 90 "$url" -o "$output"; then
      actual=$(sha256sum "$output" | awk '{print $1}')
      if [ "$expected" = "$actual" ]; then
        return 0
      fi
      echo "Попытка $attempt: CDN пока отдает предыдущую версию, повтор через 3 секунды..."
    else
      echo "Попытка $attempt не удалась, повтор через 3 секунды..."
    fi
    sleep 3
  done

  echo "Опубликованный файл не совпал со сборкой: $(basename "$local_file")" >&2
  echo "Ожидалось: $expected" >&2
  echo "Получено:  ${actual:-не получено}" >&2
  return 1
}

fetch_with_retry "$SITE_URL/" "$TMP_DIR/index.html"
grep -q '<html lang="ru">' "$TMP_DIR/index.html"
grep -q './downloads/Etalon_Brand_Guide_2025.pdf' "$TMP_DIR/index.html"
grep -q './quality-polish.css' "$TMP_DIR/index.html"
! grep -q 'at.adobe.com' "$TMP_DIR/index.html"

fetch_matching_file \
  "brand-center/downloads/Etalon_Brand_Guide_2025.pdf" \
  "$SITE_URL/downloads/Etalon_Brand_Guide_2025.pdf" \
  "$TMP_DIR/Etalon_Brand_Guide_2025.pdf"
grep -q '^%PDF-' <(head -c 8 "$TMP_DIR/Etalon_Brand_Guide_2025.pdf")
pdfinfo "$TMP_DIR/Etalon_Brand_Guide_2025.pdf" | grep -Eq '^Pages:[[:space:]]+6$'

for archive in \
  Etalon_Logos_All_Formats.zip \
  Etalon_Symbol_All_Formats.zip \
  Etalon_Map_All_Formats.zip \
  Gilroy.zip; do
  fetch_matching_file \
    "brand-center/downloads/$archive" \
    "$SITE_URL/downloads/$archive" \
    "$TMP_DIR/$archive"
  unzip -t "$TMP_DIR/$archive" >/dev/null
done

fetch_matching_file \
  "brand-center/downloads/downloads-manifest.json" \
  "$SITE_URL/downloads/downloads-manifest.json" \
  "$TMP_DIR/downloads-manifest.json"
python3 -m json.tool "$TMP_DIR/downloads-manifest.json" >/dev/null

echo "Живой сайт, размеры и все файлы скачивания проверены и совпадают со собранными версиями."
