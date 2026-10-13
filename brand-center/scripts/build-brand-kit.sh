#!/usr/bin/env bash
# Общий архив «Весь комплект»: всё, что есть на сайте, одним файлом.
# Запускать после сборки отдельных архивов.
set -euo pipefail

# Корень репозитория: в CI это GITHUB_WORKSPACE, локально текущая папка.
WORKSPACE="${GITHUB_WORKSPACE:-$PWD}"

ROOT="${1:-brand-center}"
DOWNLOADS_DIR="$ROOT/downloads"
KIT_DIR="/tmp/Etalon_Brand_Kit"
KIT_ZIP="$DOWNLOADS_DIR/Etalon_Brand_Kit.zip"

rm -rf "$KIT_DIR" "$KIT_ZIP"
mkdir -p "$KIT_DIR/04_Fonts"

unpack() {
  local archive="$1" inner="$2" target="$3"
  local tmp
  tmp=$(mktemp -d)
  unzip -q "$DOWNLOADS_DIR/$archive" -d "$tmp"
  test -d "$tmp/$inner"
  mv "$tmp/$inner" "$KIT_DIR/$target"
  rm -rf "$tmp"
}

unpack Etalon_Logos_All_Formats.zip  Etalon_Logos_All_Formats  01_Logos
unpack Etalon_Symbol_All_Formats.zip Etalon_Symbol_All_Formats 02_Symbol
unpack Etalon_Colors_All_Formats.zip Etalon_Colors_All_Formats 03_Colors

tmp=$(mktemp -d)
unzip -q "$DOWNLOADS_DIR/Gilroy.zip" -d "$tmp"
mkdir -p "$KIT_DIR/04_Fonts/Gilroy"
cp "$tmp"/*.ttf "$KIT_DIR/04_Fonts/Gilroy/"
rm -rf "$tmp"

unpack Etalon_Map_All_Formats.zip    Etalon_Map_All_Formats    05_Map

cat > "$KIT_DIR/README.txt" <<'TXT'
Фирменный стиль Группы «Эталон»: весь комплект.

01_Logos       — логотипы в трёх цветах: полная версия, без дескриптора, кириллица, латиница.
02_Symbol      — фирменный знак.
03_Colors      — палитра: карточки цветов, лист палитры, образцы ASE, CSS и JSON.
04_Fonts       — шрифт Gilroy (Regular и Medium).
05_Map         — карта присутствия, полная версия.

Форматы: SVG, прозрачный PNG, EPS и PDF.
Не изменяйте пропорции логотипов и фирменные цвета.
TXT

(
  cd /tmp
  zip -qr "$WORKSPACE/$KIT_ZIP" "$(basename "$KIT_DIR")"
)
unzip -t "$KIT_ZIP" >/dev/null
test -s "$KIT_ZIP"
