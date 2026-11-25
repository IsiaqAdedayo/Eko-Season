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
 * failures; a source that errored, or a feed nobody has refreshed, is.
 */
import { readFile } from "node:fs/promises";

const STALE_DAYS = Number(process.env.STALE_DAYS ?? 10);
const DAY = 24 * 60 * 60 * 1000;

const FEEDS = [
  { label: "shows", file: "data/show-source-status.json", count: "events" },
  { label: "movies", file: "data/movie-source-status.json", count: "films" },
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

for (const line of lines) console.log(line);

if (failures.length > 0) {
  console.error("\nHealth check failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("✓ feeds fresh and healthy");
