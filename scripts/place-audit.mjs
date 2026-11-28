#!/usr/bin/env node
/**
 * The rotation tool for place verification.
 *
 * Places have no scraper: the only thing that keeps the catalogue true is a
 * person re-checking a few of them. This prints the batch that is due, oldest
 * first, with the limit that applies to each category — so the work arrives in
 * slices instead of the whole list expiring in one week.
 *
 *   node scripts/place-audit.mjs            # next 30, oldest first
 *   node scripts/place-audit.mjs --limit=10 # a short sitting
 *   node scripts/place-audit.mjs --overdue  # only what already fails check:health
 *
 * After re-checking a place, set verifiedAt (and listedAt/checkedAt when the
 * source was re-read). `--overdue` should then go quiet for that row.
 */
import { readFile } from "node:fs/promises";

/** Kept in step with PLACE_AGE_LIMITS in scripts/check-health.mjs. */
const LIMITS = {
  eats: 90,
  play: 180,
  culture: 180,
  clubs: 180,
  beaches: 270,
  landmarks: 365,
};
const DEFAULT_LIMIT = 90;

const args = process.argv.slice(2);
const limitArg = args.find((a) => a.startsWith("--limit="));
const batch = Number(limitArg?.slice("--limit=".length) ?? 30) || 30;
const overdueOnly = args.includes("--overdue");

const places = JSON.parse(await readFile("data/places.json", "utf8")).filter(
  (place) => place.status !== "closed",
);

const today = new Date().toISOString().slice(0, 10);
const day = 86_400_000;
const rows = places
  .map((place) => {
    // Same resolution as the site and check:health — the most honest date on file.
    const date = place.verifiedAt || place.listedAt || place.checkedAt;
    const limit = LIMITS[place.category] ?? DEFAULT_LIMIT;
    const days = Math.floor((Date.parse(today) - Date.parse(date)) / day);
    return { ...place, date, limit, days, dueIn: limit - days };
  })
  .filter((row) => Number.isFinite(row.days))
  .filter((row) => (overdueOnly ? row.dueIn <= 0 : true))
  // Grouped by category (tightest limit first) so the printed checklist is
  // one sitting per kind of place, not a shuffle.
  .sort(
    (a, b) =>
      a.limit - b.limit || b.days - a.days || a.id.localeCompare(b.id),
  );

const picked = rows.slice(0, batch);
const overdue = rows.filter((row) => row.dueIn <= 0).length;

console.log(
  `${rows.length} live place(s) across these categories; ${overdue} overdue.\n` +
    `Next ${picked.length} to re-check, oldest first:\n`,
);

let category = null;
for (const row of picked) {
  if (row.category !== category) {
    category = row.category;
    console.log(`  ${category}`);
  }
  const state =
    row.dueIn <= 0 ? `OVERDUE by ${-row.dueIn}d` : `due in ${row.dueIn}d`;
  const verified = row.verifiedAt ? "verified" : "listed only";
  console.log(
    `    ${row.id.padEnd(28)} ${row.date}  ${String(row.days).padStart(4)}d  ${state.padEnd(14)} ${verified}`,
  );
}

if (picked.length === 0) console.log("  nothing due.");
