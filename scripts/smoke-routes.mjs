#!/usr/bin/env node
/**
 * Smoke-tests a running server: every route the guide exposes, the calendar
 * endpoint, the machine-readable files and the search page.
 *
 *   npm run dev            # in one shell
 *   npm run check:routes   # in another
 *
 * Point it elsewhere with `--base=http://127.0.0.1:3001`.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = (
  process.argv.find((arg) => arg.startsWith("--base="))?.slice("--base=".length) ??
  process.env.SMOKE_BASE ??
  "http://127.0.0.1:3000"
).replace(/\/$/, "");

const readJson = async (name) =>
  JSON.parse(await readFile(path.join(ROOT, "data", name), "utf8"));

const timeout = (ms) => AbortSignal.timeout(ms);

async function check(route, { marker, contentType, status = 200 } = {}) {
  const url = `${BASE}${route}`;
  try {
    const response = await fetch(url, { signal: timeout(15_000), redirect: "follow" });
    const body = await response.text();

    if (response.status !== status) {
      return { route, ok: false, why: `status ${response.status} (wanted ${status})` };
    }
    if (marker && !body.toLowerCase().includes(marker.toLowerCase())) {
      return { route, ok: false, why: `missing marker "${marker}"` };
    }
    if (contentType) {
      const actual = response.headers.get("content-type") ?? "";
      if (!actual.includes(contentType)) {
        return { route, ok: false, why: `content-type ${actual} (wanted ${contentType})` };
      }
    }
    return { route, ok: true, bytes: body.length };
  } catch (error) {
    return { route, ok: false, why: error.message };
  }
}

async function main() {
  const [shows, movies, places] = await Promise.all([
    readJson("shows.json"),
    readJson("movies.json"),
    readJson("places.json"),
  ]);

  const show = shows.events?.[0];
  const movie = movies.events?.[0];
  const place = places[0];
  const pricedShow = shows.events?.find((event) => event.priceFrom != null);

  const routes = [
    ["/", "Èkó Season"],
    ["/tonight", "Tonight in Lagos"],
    ["/shows", "Big shows"],
    ["/movies", "Movies in Lagos"],
    ["/places", "Every place in the guide"],
    ["/places/area/lekki", "Lekki"],
    ["/search?q=lekki", "Find anything in the guide"],
    ["/practicalities", "Emergency numbers"],
    ["/weather", "Lagos"],
    ["/sitemap.xml", "<urlset"],
    ["/robots.txt", "Sitemap"],
  ];

  if (show) routes.push([`/shows/${show.id}`, show.title]);
  if (place) routes.push([`/places/${place.id}`, place.name]);
  if (movie) routes.push(["/movies", movie.title]);

  let failures = 0;

  for (const [route, marker] of routes) {
    const result = await check(route, { marker });
    if (result.ok) {
      console.log(`✓ ${route} (${result.bytes} bytes)`);
    } else {
      failures += 1;
      console.error(`✗ ${route} — ${result.why}`);
    }
  }

  // The calendar endpoint must be a downloadable .ics with a VEVENT in it.
  const calendarRoute = pricedShow
    ? `/api/calendar?shows=${encodeURIComponent(pricedShow.id)}`
    : "/api/calendar";
  const calendar = await fetch(`${BASE}${calendarRoute}`, { signal: timeout(15_000) })
    .then((response) => response.text())
    .catch(() => "");
  if (calendar.includes("BEGIN:VCALENDAR") && calendar.includes("BEGIN:VEVENT")) {
    console.log(`✓ ${calendarRoute} (valid iCalendar body)`);
  } else {
    failures += 1;
    console.error(`✗ ${calendarRoute} — no VCALENDAR/VEVENT in the response`);
  }

  console.log(
    failures === 0
      ? `\n✓ ${routes.length + 1} routes ok against ${BASE}`
      : `\n✗ ${failures} route(s) failed against ${BASE}`,
  );
  if (failures > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
