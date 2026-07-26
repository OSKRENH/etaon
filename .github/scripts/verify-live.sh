#!/usr/bin/env bash
set -euo pipefail

SITE_URL="${SITE_URL:?SITE_URL is required}"
CACHE_BUST="audit=${GITHUB_SHA:-manual}"
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

fetch_with_retry "$SITE_URL/?$CACHE_BUST" "$TMP_DIR/index.html"
grep -q '<html lang="ru">' "$TMP_DIR/index.html"
grep -q './downloads/Etalon_Brand_Guide_2025.pdf' "$TMP_DIR/index.html"
grep -q './quality-polish.css' "$TMP_DIR/index.html"
! grep -q 'at.adobe.com' "$TMP_DIR/index.html"

fetch_with_retry \
  "$SITE_URL/downloads/Etalon_Brand_Guide_2025.pdf?$CACHE_BUST" \
  "$TMP_DIR/guide.pdf"
pdfinfo "$TMP_DIR/guide.pdf" | grep -Eq '^Pages:[[:space:]]+6$'

for archive in \
  Etalon_Logos_All_Formats.zip \
  Etalon_Symbol_All_Formats.zip \
  Etalon_Map_All_Formats.zip \
  Gilroy.zip; do
  fetch_with_retry \
    "$SITE_URL/downloads/$archive?$CACHE_BUST" \
    "$TMP_DIR/$archive"
  unzip -t "$TMP_DIR/$archive" >/dev/null
done

echo "Живой сайт и все файлы скачивания проверены."
