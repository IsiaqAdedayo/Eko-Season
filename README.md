# Eko-Season

A guide to Lagos: what's on this month, where to eat, and what's worth leaving
the house for.

## Weekly refresh

`scripts/refresh-all.sh` re-scrapes the shows and movie feeds, validates the data
files, then runs `scripts/check-health.mjs`. It runs Mondays at 07:00 from the
`com.ekoseason.refresh` LaunchAgent and appends to
`~/Library/Logs/ekoseason-refresh.log` (bounded at 1 MB).

The script never rewrites a data file on failure. A failing run leaves
`data/shows.json`, `data/movies.json` and `data/places.json` as they were before
it started — it only writes when a scraper produced valid, changed data. The
snapshots in `data/.snapshots/` are there so a bad run cannot be mistaken for a
successful one: if the log shows a failure, the live files are still the last
good write, not half-scrubbed output.

What "exit 1" actually means depends on which of the four steps tripped:

- **Scraper exit non-zero** — one of the feeds could not be read for this run
  (a source timed out, a page moved, a parse threw). The data files are untouched.
- **Invalid data (`validate-data.mjs` exit non-zero)** — a scraper wrote something
  malformed; the run refuses to ship it and the existing files stay in place.
- **Feed staleness (`check-health.mjs` on `STALE_DAYS`)** — the status files
  `data/show-source-status.json` / `data/movie-source-status.json` are older than
  the freshness limit. That means no successful refresh has completed recently,
  not that the public pages are blank.
- **Movie slate warning (`SLATE_WARN_DAYS`)** — the current film calendar runs out
  soon, or has already run out. The scraped movies are still written if they
  changed, but the site can only show what the source pages actually list, so a
  stale source list means `/movies` is showing last month's release calendar.
- **Place re-check limit (`PLACES_MAX_AGE_DAYS`)** — a live venue has gone too long
  without a human confirmation date. Places have no scraper, so this is the only
  signal that one may have closed or moved; it does not change the listing on the
  page, it only flags the entry.

A Monday run that exits 1 because of the movie slate does **not** empty or rewrite
the shows feed. The shows data is still whatever the last successful scrape wrote.
What changes for a visitor is narrower than the exit code suggests:

- `/shows` keeps its current listings until a fresh scrape succeeds.
- `/movies` is the part that can look stale: if the November source pages are still
  the ones in `data/movie-sources.json`, the movies page is showing the December
  release calendar (last film 16 December 2026) as if it were still current.
- The footer data stamp on each listing page still says when that feed was last
  checked; a stale movies feed is surfaced there, not hidden by a successful exit
  code.

In short: a failing Monday run is a signal to look at the log and the source list,
not an automatic rewrite of the public data. The site degrades by showing the last
known-good listings, and only the movies page can become visibly stale when the
film source list has not been advanced to the next month.

### Checking that alerts actually appear

macOS can swallow `osascript` notifications (permissions, Focus, Do Not Disturb),
and a blocked alert looks exactly like a quiet week. Fire one on purpose:

```sh
scripts/refresh-all.sh --test-alert
```

It calls the same `notify()` the scheduler uses, writes the `ALERT:` line to the
log, runs no scraper and changes no data, then exits 1 so anything watching the
exit code still sees a failed job. `REFRESH_NO_ALERT=1 scripts/refresh-all.sh
--test-alert` exercises the log-only path without a notification.
