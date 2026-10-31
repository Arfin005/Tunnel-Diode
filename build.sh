#!/bin/bash
# Assembles src/ into two self-contained pages:
#   index.html — Part 5, Tunnel Diode Lab
#   rtd.html   — Part 6, Resonant Tunneling Lab
# Pass an output directory as $1 to also write artifact-ready body files (no doctype skeleton).
set -e
cd "$(dirname "$0")"
S=src
for f in $S/core.js $S/views2d.js $S/views3d.js $S/app.js $S/part5/content.js $S/part6/rtd.js $S/part6/content.js; do node --check $f; done
page(){ # title sub out scripts... ; $DOC=1 adds the document skeleton
  local title="$1" sub="$2" out="$3"; shift 3
  { [ "$DOC" = 1 ] && echo '<!doctype html>' && echo '<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
    sed "s|{{TITLE}}|$title|" $S/head.html; [ "$DOC" = 1 ] && echo '</head><body>'
    sed -e "s|{{TITLE}}|$title|" -e "s|{{SUB}}|$sub|" $S/body.html
    echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
    echo '<script>'; cat $S/core.js $S/views2d.js $S/views3d.js "$@" $S/app.js; echo '</script>'
    [ "$DOC" = 1 ] && echo '</body></html>'; true; } > "$out"
  echo "built $out ($(wc -c < "$out") bytes)"
}
DOC=1 page "Tunnel Diode Lab" "Current-voltage characteristics \&amp; device performance · Part 5" index.html $S/part5/content.js
DOC=1 page "Resonant Tunneling Lab" "Resonant-tunneling diode · Part 6" rtd.html $S/part6/rtd.js $S/part6/content.js
if [ -n "$1" ]; then mkdir -p "$1"
  DOC=0 page "Tunnel Diode Lab" "Current-voltage characteristics \&amp; device performance · Part 5" "$1/tunnel-diode-lab.html" $S/part5/content.js
  DOC=0 page "Resonant Tunneling Lab" "Resonant-tunneling diode · Part 6" "$1/resonant-tunneling-lab.html" $S/part6/rtd.js $S/part6/content.js
fi
