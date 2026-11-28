#!/bin/bash
# Refreshes both feeds, validates the result, and keeps a bounded log.
# launchd (or cron) runs this from a minimal environment, so PATH is set here
# rather than assumed.
#
# This is the entry point for the weekly job (scripts/refresh-schedule.mjs):
# every failing scrape, invalid data file or unhealthy feed ends in a desktop
# notification and a non-zero exit, because a scheduler nobody hears from is
# worse than none.

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

# On a laptop the desktop notification is the only channel a scheduled job has.
# The alert is appended to the same log the notification points at, so a blocked
# notification still leaves a trace where someone will look.
notify() {
  local message="$1"
  echo "ALERT: $message" | tee -a "$LOG_FILE" >&2
  if [ -n "${REFRESH_NO_ALERT:-}" ]; then
    echo "DELIVERY: suppressed by REFRESH_NO_ALERT" | tee -a "$LOG_FILE" >&2
    return 0
  fi

  local escaped="${message//\\/\\\\}"
  escaped="${escaped//\"/\\\"}"

  if command -v terminal-notifier >/dev/null 2>&1; then
    if terminal-notifier -title "Èkó Season refresh failed" -message "$escaped" >/dev/null 2>&1; then
      echo "DELIVERY: terminal-notifier ok" | tee -a "$LOG_FILE" >&2
      return 0
    fi
    echo "DELIVERY: terminal-notifier failed" | tee -a "$LOG_FILE" >&2
  fi
  if command -v osascript >/dev/null 2>&1; then
    if osascript -e "display notification \"$escaped\" with title \"Èkó Season refresh failed\"" >/dev/null 2>&1; then
      echo "DELIVERY: osascript ok" | tee -a "$LOG_FILE" >&2
      return 0
    fi
    echo "DELIVERY: osascript failed — notifications are probably blocked for the app running this job" | tee -a "$LOG_FILE" >&2
    return 0
  fi
  echo "DELIVERY: no notifier available" | tee -a "$LOG_FILE" >&2
  return 0
}

# The scrapers overwrite their data files wholesale. Validation catches
# malformed data, not plausible-but-wrong data, so keep the last good copy of
# each file before the run and log what changed.
SNAPSHOT_DIR="$PROJECT_DIR/data/.snapshots"
snapshot() {
  local stamp
  stamp="$(date '+%Y%m%d-%H%M%S')"
  mkdir -p "$SNAPSHOT_DIR/$stamp"
  for file in shows.json movies.json places.json; do
    [ -f "$PROJECT_DIR/data/$file" ] && cp "$PROJECT_DIR/data/$file" "$SNAPSHOT_DIR/$stamp/$file"
  done
  local keep=0
  for dir in $(ls -1dt "$SNAPSHOT_DIR"/*/ 2>/dev/null); do
    keep=$((keep + 1))
    [ "$keep" -gt 8 ] && rm -rf "$dir"
  done
}

# One line per data set, so a run that empties a file is visible in the log even
# when every scraper exited 0.
counts() {
  "$NODE_BIN" -e '
    const fs = require("fs");
    const read = (f) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return null; } };
    const size = (d) => (Array.isArray(d) ? d.length : d?.events?.length ?? "?");
    const shows = read("data/shows.json");
    const movies = read("data/movies.json");
    const places = read("data/places.json");
    const lastShow = shows?.events?.map((e) => e.endDate ?? e.startDate).filter(Boolean).sort().at(-1) ?? "-";
    const lastFilm = movies?.events?.map((e) => e.endDate ?? e.date).filter(Boolean).sort().at(-1) ?? "-";
    console.log(`shows ${size(shows)} (to ${lastShow}) · films ${size(movies)} (to ${lastFilm}) · places ${size(places)}`);
  '
}

# --test-alert: prove the notification path works on this machine without
# waiting for a real failure or faking one. Same notify() the scheduler uses,
# same log line, no scraper runs — and it exits 1, so anything watching the exit
# code still sees a failed job rather than a quiet success.
if [ "${1:-}" = "--test-alert" ]; then
  echo "===== $(date '+%Y-%m-%d %H:%M:%S %Z') alert test (no scraping) =====" | tee -a "$LOG_FILE"
  notify "test alert — notifications reach this Mac. No data was scraped and nothing changed."
  echo "===== exit 1 (alert test) =====" | tee -a "$LOG_FILE"
  exit 1
fi

echo "===== $(date '+%Y-%m-%d %H:%M:%S %Z') refresh start (node $(node -v)) =====" | tee -a "$LOG_FILE"

snapshot
before_counts="$(counts)"
echo "before: ${before_counts}" | tee -a "$LOG_FILE"

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

# A scrape can exit 0 and still leave one source broken or a feed stale. The
# health check is what turns that into an exit code, so the alert means "someone
# should look", not merely "the script crashed".
"$NODE_BIN" scripts/check-health.mjs
health=$?
[ "$health" -ne 0 ] && status=$health

echo "after:  $(counts)" | tee -a "$LOG_FILE"
echo "===== exit ${status} (shows ${shows}, movies ${movies}, data ${data}, health ${health}) =====" | tee -a "$LOG_FILE"

if [ "$status" -ne 0 ]; then
  notify "refresh exited ${status} — shows ${shows}, movies ${movies}, data ${data}, health ${health}. Log: ${LOG_FILE}"
else
  echo "ok" >> "$LOG_FILE"
fi

exit "$status"
