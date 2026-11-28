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

import {
  classifyKind,
  dettyEvents,
  eventbriteEvents,
  eventbritePageUrl,
  inferArea,
  isNightlifeRow,
  isShowRow,
  jsonLdEvents,
  mergeEvents,
  serverData,
} from "./scrape-shows.mjs";

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

/* --------------------------------------------- Eventbrite page data (adapter) */

const ebFixture = await fixture("eventbrite-listing.html");

check(
  "page data: object found",
  serverData(ebFixture)?.search_data?.events?.results?.length,
  7,
);
check("page data: missing marker is null", serverData("<html><body>no data</body></html>"), null);
check(
  "page data: braces inside strings do not close the object",
  serverData('<script>window.__SERVER_DATA__ = {"a":"} not the end {","b":{"c":1}};</script>')?.a,
  "} not the end {",
);

const ebPaid = await eventbriteEvents(
  {
    name: "Eventbrite Lagos — parties",
    kind: "eventbrite",
    eventKind: "show",
    url: "https://www.eventbrite.com/d/nigeria--lagos/parties/",
    maxPages: 1,
  },
  ebFixture,
);

check("eventbrite: online, cancelled and duplicate rows skipped", ebPaid.length, 4);
check("eventbrite: titles", ebPaid.map((event) => event.title), [
  "Turning Up Oshodi Nights & The Adar Experience",
  "Magodo Sunday Rooftop Sessions",
  "Crypto Breakfast Seminar",
  "Intimate Wedding Reception",
]);
check("eventbrite: start and end dates", [ebPaid[0].date, ebPaid[0].endDate], [
  "2026-12-04",
  "2026-12-04",
]);
check("eventbrite: venue from page data", ebPaid[0].venue, "Adar Experience Hotel");
// The address says only "Lagos"; the title says Oshodi.
check("eventbrite: area from the title", ebPaid[0].area, "Oshodi");
// Nothing in this title locates it; the address does.
check("eventbrite: area from the address", ebPaid[1].area, "Magodo");
check("eventbrite: city is fixed to Lagos", ebPaid[0].city, "Lagos");
// Eventbrite prices its ticket JSON-LD in USD, so no naira figure is invented.
check("eventbrite: paid listing has no price", ebPaid[0].priceFrom, null);
check("eventbrite: currency stays NGN", ebPaid[0].currency, "NGN");
check("eventbrite: ticket-page enrichment skipped", ebPaid[0].noEnrich, true);
check("eventbrite: ticket link", ebPaid[0].ticketUrl, "https://www.eventbrite.com/e/turning-up-oshodi-nights-tickets-1001");
check("eventbrite: summary becomes note", ebPaid[0].note, "Friday nights in Oshodi with live performances.");
check("eventbrite: every tag kept for audit", ebPaid[0].tags.length, 8);
check("eventbrite: platform tags kept", ebPaid[0].tags[0], "Party or Social Gathering");
check("eventbrite: source name stamped", ebPaid[0].source, "Eventbrite Lagos — parties");
check("eventbrite: source url is the listing", ebPaid[0].sourceUrl, "https://www.eventbrite.com/d/nigeria--lagos/parties/");

// The adapter reports everything the page carries; the run's isShowRow pass is
// what removes a seminar and a private wedding before they reach the calendar.
check("eventbrite: noise survives the adapter", ebPaid.filter((event) => isShowRow(event)).length, 2);
check(
  "eventbrite: seminar and wedding dropped before writing",
  ebPaid.filter((event) => isShowRow(event)).map((event) => event.title),
  ["Turning Up Oshodi Nights & The Adar Experience", "Magodo Sunday Rooftop Sessions"],
);

const ebFree = await eventbriteEvents(
  {
    name: "Eventbrite Lagos — free",
    kind: "eventbrite",
    eventKind: "show",
    free: true,
    url: "https://www.eventbrite.com/d/nigeria--lagos/free--events/",
    maxPages: 1,
  },
  ebFixture,
);

// The free feed is mostly seminars and embassy sessions; a listing has to name
// a night out to survive, and the page itself states ₦0.
check("eventbrite free: only nightlife rows kept", ebFree.map((event) => event.title), [
  "Turning Up Oshodi Nights & The Adar Experience",
  "Magodo Sunday Rooftop Sessions",
]);
// A free-events listing proves a free ticket exists, not that entry is free,
// so it must not become a ₦0 entry price.
check("eventbrite free: no invented entry price", ebFree.map((event) => event.priceFrom), [null, null]);
check("eventbrite free: free ticket recorded separately", ebFree.map((event) => event.freeTicket), [true, true]);
// No key at all: a paid listing must not deny a free ticket either, or merging
// it would erase what the free feed found.
check(
  "eventbrite: paid listing says nothing about free tickets",
  "freeTicket" in ebPaid[0],
  false,
);

/* --------------------------------------------------- merge: free tickets */

// Where the two Eventbrite feeds meet, one row merges over another. A paid page
// listing the same show is not evidence that its free ticket is gone, so it must
// not clear a flag the free feed set.
// The record a previous run wrote: same show, flag set by the free feed.
const freeRecord = {
  id: "oshodi-nights",
  title: ebPaid[0].title,
  date: ebPaid[0].date,
  venue: ebPaid[0].venue,
  area: ebPaid[0].area,
  city: ebPaid[0].city,
  priceFrom: null,
  currency: "NGN",
  freeTicket: true,
  tiers: [],
  tags: [],
};

// The paid row comes straight from the adapter, so this covers the whole path:
// a paid page must not erase what the free page found.
check(
  "merge: a paid row leaves a free-ticket flag alone",
  mergeEvents([{ ...freeRecord }], [ebPaid[0]]).events[0].freeTicket,
  true,
);

// The free feed answers for itself: when its row says the listing no longer
// carries a free ticket, the flag goes instead of lingering as a stale claim.
const freeRowWithoutTicket = { ...ebFree[0], freeTicket: false };

check(
  "merge: a free-feed row without a ticket clears the flag",
  "freeTicket" in
    mergeEvents([{ ...freeRecord }], [freeRowWithoutTicket]).events[0],
  false,
);

// And the free feed is what puts the flag there in the first place.
const { freeTicket: _none, ...recordWithoutFlag } = freeRecord;
check(
  "merge: a free-feed row sets the flag on an existing show",
  mergeEvents([recordWithoutFlag], [ebFree[0]]).events[0].freeTicket,
  true,
);

/* ------------------------------------------- Eventbrite paging (multi-page) */

const baseUrl = "https://www.eventbrite.com/d/nigeria--lagos/parties/";

check("paging: page two joins with ?", eventbritePageUrl(baseUrl, 2), `${baseUrl}?page=2`);
check("paging: an existing query takes &", eventbritePageUrl(`${baseUrl}?q=x`, 3), `${baseUrl}?q=x&page=3`);
check("paging: page one is the listing itself", eventbritePageUrl(baseUrl, 1), baseUrl);

// Page two is built from the same fixture, so no second file is needed: the
// saved page-data object is re-served with a different page_count and rows.
const pageData = serverData(ebFixture);
const fixtureRows = pageData.search_data.events.results;
const listingHtml = (pageCount, results) =>
  `<script>window.__SERVER_DATA__ = ${JSON.stringify({
    ...pageData,
    search_data: {
      events: { pagination: { object_count: 99, page_count: pageCount }, results },
    },
  })};</script>`;

const paged = new Map([
  [baseUrl, listingHtml(2, fixtureRows)],
  [
    eventbritePageUrl(baseUrl, 2),
    listingHtml(2, [
      fixtureRows[0], // same eid as page one: must not be listed twice
      { ...fixtureRows[1], eid: "2001", name: "Ikoyi Jazz Night" },
    ]),
  ],
  // page_count is 2, so this page must never be read — the row proves it.
  [
    eventbritePageUrl(baseUrl, 3),
    listingHtml(2, [
      { ...fixtureRows[1], eid: "3001", name: "Page Three Must Not Load" },
    ]),
  ],
]);

const multi = await eventbriteEvents(
  {
    name: "Eventbrite Lagos — parties",
    kind: "eventbrite",
    eventKind: "show",
    url: baseUrl,
    maxPages: 5,
  },
  paged,
);

const multiTitles = multi.map((event) => event.title);
check("paging: page two is read", multiTitles.includes("Ikoyi Jazz Night"), true);
check("paging: page_count stops the loop", multiTitles.includes("Page Three Must Not Load"), false);
check(
  "paging: duplicate id across pages skipped",
  multiTitles.filter((title) => title === "Turning Up Oshodi Nights & The Adar Experience").length,
  1,
);
check("paging: rows from both pages, nothing else", multi.length, 5);

/* --------------------------------------------------------- area inference */

check("area: Lekki Phase 1 before bare Lekki", inferArea("Lekki Phase 1"), "Lekki Phase 1");
check("area: Admiralty Way is Lekki Phase 1", inferArea("12 Admiralty Way"), "Lekki Phase 1");
check("area: Oniru wins over the street name", inferArea("Landmark Beach", "Water Corporation Drive"), "Oniru");
check("area: Magodo from an address", inferArea("Magodo GRA Phase 2"), "Magodo");
check("area: Ikeja from a landmark", inferArea("Radisson Blu", "Ikeja GRA, Opebi Road"), "Ikeja");
check("area: case-insensitive", inferArea("VICTORIA ISLAND"), "Victoria Island");
check("area: a bare city name is not an area", inferArea("Lagos"), null);
check("area: unplaceable text stays null", inferArea("Somewhere else entirely"), null);
check("area: empty input stays null", inferArea(null, "", undefined), null);

/* ------------------------------------------------------ party classification */

check("kind: party word in title", classifyKind("show", "Beach Rave", []), "party");
check("kind: all-white boat cruise", classifyKind("show", "All White Boat Cruise", []), "party");
check("kind: concert stays a show", classifyKind("show", "Davido Live in Concert", ["Music"]), "show");
check("kind: platform party tag wins", classifyKind("show", "Album Listening", ["Party or Social Gathering"]), "party");
check("kind: nightlife tag wins", classifyKind("show", "Afrobeats Night", ["Nightlife"]), "party");
check("kind: party source is the fallback", classifyKind("party", "Sunday Service", []), "party");

check("nightlife: seminar rejected", isNightlifeRow("Crypto Breakfast Seminar", ["Business"]), false);
check("nightlife: day party kept", isNightlifeRow("Amapiano Day Party", []), true);
check("nightlife: platform tag is enough", isNightlifeRow("Sunday Gathering", ["Nightlife"]), true);
check("nightlife: church service rejected", isNightlifeRow("Church Thanksgiving Service", ["Religion"]), false);
// A club by name is not a night out: only night-club forms count as nightlife.
check("nightlife: book club rejected", isNightlifeRow("Book Club", ["Food & Drink"]), false);
check("nightlife: polo club rejected", isNightlifeRow("Polo Club", []), false);
check("nightlife: rotary club rejected", isNightlifeRow("Rotary Club", ["Clubs & Associations"]), false);
check("kind: a club name is not a party", classifyKind("show", "Rotary Club", []), "show");
check("nightlife: club night kept", isNightlifeRow("Quilox Club Night", []), true);
check("nightlife: nightclub kept", isNightlifeRow("Nightclub", []), true);

// The noise lists know what an event is, not what is on the menu. A food word
// disqualifies a listing unless the title itself names a party, because the
// platform's own tag will happily call a restaurant promo a party.
check("noise: book club dropped", isShowRow({ title: "Book Club" }), false);
check("noise: wedding rejected", isShowRow({ title: "Intimate Wedding Reception" }), false);
check("noise: seminar rejected", isShowRow({ title: "Crypto Breakfast Seminar" }), false);
check("noise: restaurant promo rejected", isShowRow({ title: "Terraform Grills - the best Grilled & Barbeque spot" }), false);
check("noise: potluck picnic rejected", isShowRow({ title: "December Potluck Picnic" }), false);
check("noise: picnic without a party word rejected", isShowRow({ title: "Sunday Picnic & Games", kind: "party" }), false);
check("noise: beach BBQ party kept", isShowRow({ title: "Sunday Beach BBQ Party", kind: "party" }), true);

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} failed, ${passed} passed\n`);
  for (const failure of failures) console.error(`  ✗ ${failure}\n`);
  process.exit(1);
}

console.log(`✓ ${passed} show parser assertions passed`);
