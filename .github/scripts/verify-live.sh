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

assert_same_file() {
  local local_file="$1"
  local live_file="$2"
  local expected actual

  expected=$(sha256sum "$local_file" | awk '{print $1}')
  actual=$(sha256sum "$live_file" | awk '{print $1}')
  if [ "$expected" != "$actual" ]; then
    echo "Контрольная сумма не совпала: $(basename "$local_file")" >&2
    echo "Ожидалось: $expected" >&2
    echo "Получено:  $actual" >&2
    return 1
  fi
}

fetch_with_retry "$SITE_URL/" "$TMP_DIR/index.html"
grep -q '<html lang="ru">' "$TMP_DIR/index.html"
grep -q './downloads/Etalon_Brand_Guide_2025.pdf' "$TMP_DIR/index.html"
grep -q './quality-polish.css' "$TMP_DIR/index.html"
! grep -q 'at.adobe.com' "$TMP_DIR/index.html"

fetch_with_retry \
  "$SITE_URL/downloads/Etalon_Brand_Guide_2025.pdf" \
  "$TMP_DIR/Etalon_Brand_Guide_2025.pdf"
grep -q '^%PDF-' <(head -c 8 "$TMP_DIR/Etalon_Brand_Guide_2025.pdf")
pdfinfo "$TMP_DIR/Etalon_Brand_Guide_2025.pdf" | grep -Eq '^Pages:[[:space:]]+6$'
assert_same_file \
  "brand-center/downloads/Etalon_Brand_Guide_2025.pdf" \
  "$TMP_DIR/Etalon_Brand_Guide_2025.pdf"

for archive in \
  Etalon_Logos_All_Formats.zip \
  Etalon_Symbol_All_Formats.zip \
  Etalon_Map_All_Formats.zip \
  Gilroy.zip; do
  fetch_with_retry \
    "$SITE_URL/downloads/$archive" \
    "$TMP_DIR/$archive"
  unzip -t "$TMP_DIR/$archive" >/dev/null
  assert_same_file "brand-center/downloads/$archive" "$TMP_DIR/$archive"
done

echo "Живой сайт и все файлы скачивания проверены и совпадают с собранными версиями."
