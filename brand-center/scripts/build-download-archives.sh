#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-brand-center}"
LOGOS_DIR="$ROOT/assets/logos"
DOWNLOADS_DIR="$ROOT/downloads"
LOGOS_BUILD="/tmp/Etalon_Logos_All_Formats"
SYMBOL_BUILD="/tmp/Etalon_Symbol_All_Formats"
MAP_BUILD="/tmp/Etalon_Map_All_Formats"

rm -rf "$LOGOS_BUILD" "$SYMBOL_BUILD" "$MAP_BUILD"
mkdir -p "$DOWNLOADS_DIR" "$LOGOS_BUILD" "$SYMBOL_BUILD" "$MAP_BUILD"

export_asset() {
  local input="$1"
  local output_dir="$2"
  local base_name="$3"
  local png_width="${4:-2400}"

  mkdir -p "$output_dir"
  cp "$input" "$output_dir/$base_name.svg"
  inkscape "$input" --export-type=png --export-filename="$output_dir/$base_name.png" --export-background-opacity=0 --export-width="$png_width" >/dev/null
  inkscape "$input" --export-type=pdf --export-filename="$output_dir/$base_name.pdf" >/dev/null
  inkscape "$input" --export-type=eps --export-filename="$output_dir/$base_name.eps" >/dev/null
}

declare -A FOLDERS=(
  [group]="Group_Etalon"
  [ru]="Etalon_RU"
  [en]="Etalon_EN"
  [symbol]="Symbol"
)

declare -A LABELS=(
  [group]="Etalon_Group"
  [ru]="Etalon_RU"
  [en]="Etalon_EN"
  [symbol]="Etalon_Symbol"
)

declare -A TONE_LABELS=(
  [blue]="Blue"
  [white]="White"
  [black]="Black"
)

for key in group ru en symbol; do
  for tone in blue white black; do
    input="$LOGOS_DIR/$key-$tone.svg"
    test -s "$input"
    tone_label="${TONE_LABELS[$tone]}"
    base_name="${LABELS[$key]}_${tone_label}"
    target="$LOGOS_BUILD/${FOLDERS[$key]}/$tone_label"
    export_asset "$input" "$target" "$base_name" 2400

    if [[ "$key" == "symbol" ]]; then
      symbol_target="$SYMBOL_BUILD/$tone_label"
      export_asset "$input" "$symbol_target" "$base_name" 1600
    fi
  done
done

cat > "$LOGOS_BUILD/README.txt" <<'EOF'
Логотипы Группы «Эталон» во всех цветовых версиях.

Форматы:
SVG — редактируемый вектор
PNG — прозрачный фон
EPS — вектор для профессиональной печати
PDF — универсальный векторный формат

Цвета:
Blue — фирменный синий
White — белый
Black — черный

Не изменяйте пропорции логотипов.
EOF

cat > "$SYMBOL_BUILD/README.txt" <<'EOF'
Фирменный знак Группы «Эталон» во всех цветовых версиях.
Форматы: SVG, прозрачный PNG, EPS и PDF.
EOF

MAP_SVG="$ROOT/assets/regions-map.svg"
test -s "$MAP_SVG"
export_asset "$MAP_SVG" "$MAP_BUILD" "Etalon_Map" 3600
cat > "$MAP_BUILD/README.txt" <<'EOF'
Карта присутствия Группы «Эталон» без точек и подписей.
Форматы: SVG, прозрачный PNG, EPS и PDF.
EOF

rm -f \
  "$DOWNLOADS_DIR/Etalon_Logos_All_Colors.zip" \
  "$DOWNLOADS_DIR/Etalon_Logos_All_Formats.zip" \
  "$DOWNLOADS_DIR/Etalon_Symbol_All_Formats.zip" \
  "$DOWNLOADS_DIR/Etalon_Map_All_Formats.zip"

(
  cd /tmp
  zip -qr "$GITHUB_WORKSPACE/$DOWNLOADS_DIR/Etalon_Logos_All_Formats.zip" "$(basename "$LOGOS_BUILD")"
  zip -qr "$GITHUB_WORKSPACE/$DOWNLOADS_DIR/Etalon_Symbol_All_Formats.zip" "$(basename "$SYMBOL_BUILD")"
  zip -qr "$GITHUB_WORKSPACE/$DOWNLOADS_DIR/Etalon_Map_All_Formats.zip" "$(basename "$MAP_BUILD")"
)

unzip -t "$DOWNLOADS_DIR/Etalon_Logos_All_Formats.zip" >/dev/null
unzip -t "$DOWNLOADS_DIR/Etalon_Symbol_All_Formats.zip" >/dev/null
unzip -t "$DOWNLOADS_DIR/Etalon_Map_All_Formats.zip" >/dev/null

test "$(stat -c%s "$DOWNLOADS_DIR/Etalon_Logos_All_Formats.zip")" -gt 50000
test "$(stat -c%s "$DOWNLOADS_DIR/Etalon_Symbol_All_Formats.zip")" -gt 10000
test "$(stat -c%s "$DOWNLOADS_DIR/Etalon_Map_All_Formats.zip")" -gt 100000
