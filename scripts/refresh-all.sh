#!/bin/bash
# Refreshes both feeds, validates the result, and keeps a bounded log.
# launchd (or cron) runs this from a minimal environment, so PATH is set here
# rather than assumed.

set -uo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$HOME/Library/Logs"
LOG_FILE="$LOG_DIR/ekoseason-refresh.log"
MAX_LOG_BYTES=$((1024 * 1024))

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

cd "$PROJECT_DIR" || { echo "cannot cd to $PROJECT_DIR" >&2; exit 1; }

NODE_BIN="$(command -v node || true)"
if [ -z "$NODE_BIN" ]; then
  echo "node not found on PATH ($PATH)" >&2
  exit 127
fi

mkdir -p "$LOG_DIR"
if [ -f "$LOG_FILE" ] && [ "$(stat -f%z "$LOG_FILE" 2>/dev/null || echo 0)" -gt "$MAX_LOG_BYTES" ]; then
  tail -n 2000 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
fi

echo "===== $(date '+%Y-%m-%d %H:%M:%S %Z') refresh start (node $(node -v)) =====" | tee -a "$LOG_FILE"

status=0

# Shows first: they have the widest source list and the most fragility.
"$NODE_BIN" scripts/scrape-shows.mjs
shows=$?
[ "$shows" -ne 0 ] && status=$shows

"$NODE_BIN" scripts/scrape-movies.mjs
movies=$?
[ "$movies" -ne 0 ] && status=$movies

# Never let a bad scrape ship: this only reads the files the scrapers wrote.
"$NODE_BIN" scripts/validate-data.mjs
data=$?
[ "$data" -ne 0 ] && status=$data

echo "===== exit ${status} (shows ${shows}, movies ${movies}, data ${data}) ====="

exit "$status"
