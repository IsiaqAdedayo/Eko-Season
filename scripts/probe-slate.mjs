#!/usr/bin/env node
/**
 * Look for the next month's release slate before the current one runs out.
 *
 * The movie scraper refuses to invent a month, which is right, but that left
 * discovering the next page as a job for whoever notices the alert. This probes
 * the sources already in data/movie-sources.json by rolling the month and year
 * in their URLs forward, and reports which candidates actually return a page
 * naming that month.
 *
 * It never writes: a candidate that parses is still a human's call to add to
 * data/movie-sources.json, because "contains January 2027" is weaker evidence
 * than the scraper's own structure checks.
 *
 *   node scripts/probe-slate.mjs [--months=3]
 */
import { readFile } from "node:fs/promises";

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];
const UA = "EkoseasonConciergeBot/1.0 (release-slate prober)";
const monthsArg = process.argv.find((a) => a.startsWith("--months="));
const AHEAD = Number(monthsArg?.slice("--months=".length) ?? 3) || 3;

const sources = JSON.parse(await readFile("data/movie-sources.json", "utf8"));
const today = new Date();

/** Roll a URL's month/year tokens forward by one month, keeping its spelling. */
function roll(url, monthsAhead) {
  const match = url.match(/(january|february|march|april|may|june|july|august|september|october|november|december)[-_ ]?(\d{4})/i);
  if (!match) return null;
  const index = MONTHS.indexOf(match[1].toLowerCase()) + monthsAhead;
  const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + index, 1));
  const month = MONTHS[date.getUTCMonth()];
  const year = String(date.getUTCFullYear());
  const spelled = match[0][0] === match[0][0].toUpperCase() ? month[0].toUpperCase() + month.slice(1) : month;
  return {
    month,
    year,
    url: url.replace(match[0], `${spelled}${match[0].slice(match[1].length, -4) || "-"}${year}`),
  };
}

async function probe(candidate) {
  try {
    const res = await fetch(candidate.url, {
      headers: { "user-agent": UA },
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return { state: `${res.status}`, ok: false };
    const body = (await res.text()).toLowerCase();
    const names = body.includes(`${candidate.month} ${candidate.year}`);
    return { state: names ? "names the month" : "no month name", ok: names };
  } catch (error) {
    return { state: `error: ${error.message}`, ok: false };
  }
}

let found = 0;
for (const source of sources.sources ?? []) {
  console.log(`\n${source.name}\n  ${source.url}`);
  for (let ahead = 1; ahead <= AHEAD; ahead += 1) {
    const candidate = roll(source.url, ahead);
    if (!candidate) {
      console.log("  no month/year in this URL — nothing to roll");
      break;
    }
    const result = await probe(candidate);
    if (result.ok) found += 1;
    console.log(`  ${result.ok ? "FOUND " : "      "}${candidate.month} ${candidate.year} — ${result.state}\n        ${candidate.url}`);
  }
}

console.log(
  found > 0
    ? `\n${found} candidate page(s) look like a real slate. Add the one you trust to data/movie-sources.json, then run npm run scrape:movies.`
    : "\nNo candidate returned a page naming a future month. The next slate may not be published yet, or the URL pattern changed — check the source's index page by hand.",
);
