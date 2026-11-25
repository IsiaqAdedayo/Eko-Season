#!/usr/bin/env node
/**
 * Fixture tests for the shows scrapers.
 *
 * The festival page is the whole calendar's source of truth; when it changes
 * shape the site empties silently. These run the real parsers against saved
 * HTML so a layout change fails here, not in production.
 *
 * Run: node scripts/test-show-parsers.mjs
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { dettyEvents, isShowRow, jsonLdEvents } from "./scrape-shows.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixture = (name) => readFile(path.join(ROOT, "scripts/fixtures", name), "utf8");

let passed = 0;
const failures = [];

function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    passed += 1;
  } else {
    failures.push(`${label}\n    expected ${JSON.stringify(expected)}\n    received ${JSON.stringify(actual)}`);
  }
}

const listing = await dettyEvents(
  { name: "Detty December Fest", url: "https://dettydecfest.com/events/" },
  new Map([
    ["detty december opening night", "https://tix.dot360.co/event/detty-december-opening-night"],
  ]),
  await fixture("detty-events.html"),
);

check("listing: event count", listing.length, 2);
check("listing: title", listing[0].title, "Detty December Opening Night");
check("listing: single-night date", listing[0].date, "2026-12-06");
check("listing: single-night end date", listing[0].endDate, "2026-12-06");
check("listing: venue", listing[0].venue, "Detty Village");
// The festival publishes only "Lagos" — never invent a neighbourhood.
check("listing: area stays null", listing[0].area, null);
check("listing: city", listing[0].city, "Lagos");
check("listing: ticket link from map", listing[0].ticketUrl, "https://tix.dot360.co/event/detty-december-opening-night");
check("listing: multi-night end date", listing[1].endDate, "2026-12-14");
check("listing: unmatched show has no ticket link", listing[1].ticketUrl, null);
check("listing: source name", listing[0].source, "Detty December Fest");
check("listing: description becomes note", listing[0].note, "Opening night at the village.");

const page = await jsonLdEvents(
  { name: "dettydecfest.com", url: "https://dettydecfest.com/events/opening-night/" },
  await fixture("detty-event-page.html"),
);

check("page: only the Event node counted", page.length, 1);
check("page: performer", page[0].artists, ["DJ Neptune"]);
check("page: street becomes area", page[0].area, "Victoria Island");
check("page: cheapest available tier", page[0].priceFrom, 25000);
check("page: sold-out tier flagged", page[0].tiers[1].soldOut, true);
check("page: offer url is the ticket link", page[0].ticketUrl, "https://tix.dot360.co/event/detty-december-opening-night");

check("noise: navigation title rejected", isShowRow({ title: "Calendar" }), false);
check("noise: real title kept", isShowRow({ title: "Detty December Opening Night" }), true);

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} failed, ${passed} passed\n`);
  for (const failure of failures) console.error(`  ✗ ${failure}\n`);
  process.exit(1);
}

console.log(`✓ ${passed} show parser assertions passed`);
