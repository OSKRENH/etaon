#!/usr/bin/env bash
# Общий архив «Весь комплект»: всё, что есть на сайте, одним файлом.
# Запускать после сборки отдельных архивов и PDF-руководства.
set -euo pipefail

ROOT="${1:-brand-center}"
DOWNLOADS_DIR="$ROOT/downloads"
KIT_DIR="/tmp/Etalon_Brand_Kit"
KIT_ZIP="$DOWNLOADS_DIR/Etalon_Brand_Kit.zip"

rm -rf "$KIT_DIR" "$KIT_ZIP"
mkdir -p "$KIT_DIR/01_Brand_Guide" "$KIT_DIR/06_Fonts"

cp "$DOWNLOADS_DIR/Etalon_Brand_Guide_2025.pdf" "$KIT_DIR/01_Brand_Guide/"

unpack() {
  local archive="$1" inner="$2" target="$3"
  local tmp
  tmp=$(mktemp -d)
  unzip -q "$DOWNLOADS_DIR/$archive" -d "$tmp"
  test -d "$tmp/$inner"
  mv "$tmp/$inner" "$KIT_DIR/$target"
  rm -rf "$tmp"
}

unpack Etalon_Logos_All_Formats.zip  Etalon_Logos_All_Formats  02_Logos
unpack Etalon_Symbol_All_Formats.zip Etalon_Symbol_All_Formats 03_Symbol
unpack Etalon_Colors_All_Formats.zip Etalon_Colors_All_Formats 04_Colors
unpack Etalon_Map_All_Formats.zip    Etalon_Map_All_Formats    05_Map

tmp=$(mktemp -d)
unzip -q "$DOWNLOADS_DIR/Gilroy.zip" -d "$tmp"
mkdir -p "$KIT_DIR/06_Fonts/Gilroy"
cp "$tmp"/*.ttf "$KIT_DIR/06_Fonts/Gilroy/"
rm -rf "$tmp"

cat > "$KIT_DIR/README.txt" <<'TXT'
Фирменный стиль Группы «Эталон»: весь комплект.

01_Brand_Guide — руководство по фирменному стилю (PDF).
02_Logos       — логотипы в трёх цветах: полная версия, без дескриптора, кириллица, латиница.
03_Symbol      — фирменный знак.
04_Colors      — палитра: карточки цветов, лист палитры, образцы ASE, CSS и JSON.
05_Map         — карта присутствия, полная версия.
06_Fonts       — шрифт Gilroy (Regular и Medium).

Форматы: SVG, прозрачный PNG, EPS и PDF.
Не изменяйте пропорции логотипов и фирменные цвета.
TXT

(
  cd /tmp
  zip -qr "$GITHUB_WORKSPACE/$KIT_ZIP" "$(basename "$KIT_DIR")"
)
unzip -t "$KIT_ZIP" >/dev/null
test -s "$KIT_ZIP"
