#!/usr/bin/env bash
# Screen-record for a fixed duration while `npm run record` runs in another terminal.
OUT="${1:-demo.mov}"
DUR="${2:-100}"
echo "Recording screen → $OUT for ${DUR}s (Ctrl-C to stop early)…"
screencapture -v -V "$DUR" "$OUT"
echo "Saved $OUT"
