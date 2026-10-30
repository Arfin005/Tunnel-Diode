#!/bin/bash
# Assembles src/ into a single self-contained index.html.
set -e
cd "$(dirname "$0")"
S=src
for f in core views2d views3d content app; do node --check $S/$f.js; done
{ echo '<!doctype html>'
  echo '<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
  cat $S/head.html; echo '</head><body>'; cat $S/body.html
  echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
  echo '<script>'; cat $S/core.js $S/views2d.js $S/views3d.js $S/content.js $S/app.js; echo '</script>'
  echo '</body></html>'; } > index.html
echo "built index.html ($(wc -c < index.html) bytes)"
