#!/usr/bin/env node
/**
 * Exit non-zero when a refresh has failed or gone stale.
 *
 * The scrapers already write data/*-source-status.json; nothing ever read them
 * on a schedule, so a broken source could age silently into wrong listings.
 * Point cron or CI at this script and the exit code is the alert:
 *
 *   0 6 * * *  cd /path/to/eko-season && npm run check:health || <your alert>
 *
 * Sources that legitimately return nothing (a quiet Nollywood month) are not
 * failures; a source that errored, a feed nobody has refreshed, or a place
 * nobody has re-checked is.
 */
import { readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { slateEnd } from "./scrape-movies.mjs";

/** Overridable so scripts/test-health.mjs can point the checks at fixtures. */
const DATA_DIR = process.env.DATA_DIR ?? "data";

const STALE_DAYS = Number(process.env.STALE_DAYS ?? 10);
/** How far ahead the film slate starts failing, so there is time to add a page. */
const SLATE_WARN_DAYS = Number(process.env.SLATE_WARN_DAYS ?? 10);
/**
 * Places change slowly but they do change: a restaurant closes, a club rebrands,
 * an address moves. Nothing on the page looks broken while it is wrong, and no
 * scraper watches them, so age is the only signal we have. A quarter is long
 * enough to be practical and short enough that /eat cannot become last year's.
 */
const PLACES_MAX_AGE_DAYS = Number(process.env.PLACES_MAX_AGE_DAYS ?? 90);
/**
 * How long each kind of place may go unverified before the run fails.
 *
 * The dates are meant to rotate, not all expire together: a restaurant can
 * close overnight, a landmark cannot. Staggering the limits is what stops the
 * whole catalogue tripping the check in the same week and turning the alert
 * into noise.
 */
const PLACE_AGE_LIMITS = {
  eats: 90,
  play: 180,
  culture: 180,
  clubs: 180,
  beaches: 270,
  landmarks: 365,
};
const DEFAULT_PLACE_AGE_DAYS = 90;
/** The scheduled job's log. A log that stops growing is a silent outage. */
const REFRESH_LOG =
  process.env.REFRESH_LOG ??
  path.join(os.homedir(), "Library/Logs/ekoseason-refresh.log");
const HEARTBEAT_DAYS = Number(process.env.REFRESH_HEARTBEAT_DAYS ?? 8);
const DAY = 24 * 60 * 60 * 1000;

const FEEDS = [
  {
    label: "shows",
    file: path.join(DATA_DIR, "show-source-status.json"),
    count: "events",
  },
  {
    label: "movies",
    file: path.join(DATA_DIR, "movie-source-status.json"),
    count: "films",
  },
];

const failures = [];
const lines = [];

for (const feed of FEEDS) {
  let status;
  try {
    status = JSON.parse(await readFile(feed.file, "utf8"));
  } catch (error) {
    failures.push(`${feed.label}: cannot read ${feed.file} (${error.message})`);
    continue;
  }

  const checkedAt = new Date(status.checkedAt ?? 0);
  const ageDays = Math.floor((Date.now() - checkedAt.getTime()) / DAY);
  const sources = status.sources ?? [];
  const items = sources.reduce((sum, source) => sum + (source[feed.count] ?? 0), 0);

  lines.push(
    `${feed.label}: ${sources.length} source(s), ${items} item(s), last refresh ${
      Number.isNaN(ageDays) ? "unknown" : `${ageDays} day(s) ago`
    }`,
  );

  if (!status.checkedAt || Number.isNaN(ageDays)) {
    failures.push(`${feed.label}: no valid checkedAt in ${feed.file}`);
  } else if (ageDays > STALE_DAYS) {
    failures.push(
      `${feed.label}: last refresh was ${ageDays} days ago (limit ${STALE_DAYS})`,
    );
  }

  for (const source of sources) {
    if (!source.ok) {
      failures.push(
        `${feed.label}: ${source.name} failed — ${source.error ?? "no error detail"}`,
      );
    }
  }

  if (items === 0) {
    failures.push(`${feed.label}: every source returned 0 items`);
  }
}

// Freshness of the status file is not the same as a current slate: the movie
// pages can be scraped every week and still be last month's article. This is
// the check that sees the calendar running out before /movies goes blank.
{
  try {
    const movies = JSON.parse(
      await readFile(path.join(DATA_DIR, "movies.json"), "utf8"),
    );
    const slate = slateEnd(movies.events ?? []);
    if (!slate.last) {
      failures.push("movies: no release dates on file");
    } else {
      lines.push(
        `movies: slate runs to ${slate.last} (${slate.daysLeft} day(s) left)`,
      );
      if (slate.daysLeft <= SLATE_WARN_DAYS) {
        failures.push(
          slate.daysLeft < 0
            ? `movies: the slate ended on ${slate.last} — add the next month's release page`
            : `movies: the slate ends on ${slate.last}, ${slate.daysLeft} day(s) from now — add the next month's release page`,
        );
      }
    }
  } catch (error) {
    failures.push(`movies: cannot read ${DATA_DIR}/movies.json (${error.message})`);
  }
}

// Places have no scraper and no status file — they are edited by hand. That is
// exactly why they need this: the movie slate could fail loudly because a run
// noticed, while a closed restaurant just sat there looking fine.
{
  try {
    const places = JSON.parse(
      await readFile(path.join(DATA_DIR, "places.json"), "utf8"),
    );
    const live = (Array.isArray(places) ? places : places.places ?? []).filter(
      (place) => place.status !== "closed",
    );
    const ageInDays = (iso) =>
      Math.floor((Date.now() - Date.parse(iso)) / DAY);

    // Only a verifiedAt says someone confirmed the card; listedAt is the day a
    // source was read. Age whichever date is the most honest one on file.
    const confirmedOn = (place) =>
      place.verifiedAt || place.listedAt || place.checkedAt;
    const verified = live.filter((place) => place.verifiedAt).length;

    // A category limit unless the operator pins one limit for everything.
    const limitFor = (place) =>
      Number.isFinite(PLACES_MAX_AGE_DAYS) && process.env.PLACES_MAX_AGE_DAYS
        ? PLACES_MAX_AGE_DAYS
        : (PLACE_AGE_LIMITS[place.category] ?? DEFAULT_PLACE_AGE_DAYS);

    const stale = live
      .map((place) => ({ id: place.id, days: ageInDays(confirmedOn(place)), limit: limitFor(place) }))
      .filter(({ days, limit }) => !Number.isFinite(days) || days > limit);

    const oldest = Math.max(
      0,
      ...live.map((place) => ageInDays(confirmedOn(place))).filter(Number.isFinite),
    );
    lines.push(
      `places: ${live.length} live, ${verified} verified, oldest date ${oldest} day(s) ago`,
    );

    if (stale.length > 0) {
      const sample = stale
        .slice(0, 5)
        .map(({ id, days, limit }) =>
          Number.isFinite(days) ? `${id} (${days}d > ${limit}d)` : `${id} (no readable date)`,
        )
        .join(", ");
      failures.push(
        `places: ${stale.length} past its re-check limit — ${sample}` +
          (stale.length > 5 ? `, +${stale.length - 5} more` : ""),
      );
    }
  } catch (error) {
    failures.push(`places: cannot read ${DATA_DIR}/places.json (${error.message})`);
  }
}

// The whole honesty system ends in one notification. If the weekly job stops
// running — launchd unloaded the agent, the machine was asleep for a month —
// nothing else notices, because no scraper ran to fail. A log that stops
// growing is the only trace, so it is checked here.
{
  let log = null;
  try {
    log = await readFile(REFRESH_LOG, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      failures.push(`refresh: cannot read ${REFRESH_LOG} (${error.message})`);
    }
  }

  if (log !== null) {
    const stamps = log
      .split("\n")
      .map((line) =>
        line.includes("refresh start") || line.includes("alert test")
          ? line.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/)?.[1]
          : null,
      )
      .filter(Boolean)
      .map((stamp) => new Date(stamp.replace(" ", "T")).getTime())
      .filter((time) => Number.isFinite(time));

    if (stamps.length === 0) {
      failures.push(`refresh: no run recorded in ${REFRESH_LOG}`);
    } else {
      const last = Math.max(...stamps);
      const age = Math.floor((Date.now() - last) / DAY);
      lines.push(`refresh: last run ${age} day(s) ago`);
      if (age > HEARTBEAT_DAYS) {
        failures.push(
          `refresh: the scheduled job has not run for ${age} days (limit ${HEARTBEAT_DAYS}) — check the LaunchAgent`,
        );
      }
    }
  }
}

for (const line of lines) console.log(line);

if (failures.length > 0) {
  console.error("\nHealth check failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("✓ feeds and places fresh and healthy");
