#!/usr/bin/env node
/**
 * Big-shows refresh job.
 *
 *   1. Reads data/show-sources.json to see which sites to watch.
 *   2. Discovers events (the Detty December Fest calendar publishes its shows
 *      as schema.org event data).
 *   3. Follows each show's ticket link and reads prices from the ticket page
 *      (also schema.org), so prices are not typed in by hand.
 *   4. Merges into data/shows.json: new shows appended, known shows updated,
 *      finished shows dropped. Hand-written fields (artists, notes) survive.
 *   5. Writes only when something changed, so an idle run produces no diff,
 *      but always records per-source health in data/show-source-status.json
 *      so a silently broken source shows up instead of just fewer shows.
 *
 * Exit codes: 0 = ran (changed or not), 1 = nothing scraped, the run would
 * drop more than a few events, or the data could not be validated — the
 * scheduled job surfaces that as a failure instead of silently looking
 * healthy.
 *
 * Run: node scripts/scrape-shows.mjs [--dry-run] [--allow-drop]
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_FILE = path.join(ROOT, "data/shows.json");
const SOURCES_FILE = path.join(ROOT, "data/show-sources.json");
const STATUS_FILE = path.join(ROOT, "data/show-source-status.json");

const DRY_RUN = process.argv.includes("--dry-run");
const ALLOW_DROP = process.argv.includes("--allow-drop");
/** Losing more than this in one run is treated as a bad scrape, not news. */
const MAX_DROPPED = 3;
/** How far ahead a listing is kept: a year covers anything announced early. */
const WINDOW_DAYS = 366;
const UA = "LagosGuideShowsBot/1.0 (event listing refresher for Eko Season)";
const REQUEST_TIMEOUT_MS = 25_000;
const MAX_ATTEMPTS = 2;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const today = () => new Date().toISOString().slice(0, 10);

const addDays = (iso, days) => {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

/* ------------------------------------------------------------------ utils */

const isClientError = (error) => /^4\d\d /.test(String(error?.message ?? ""));

/** One retry for timeouts and 5xx; 4xx is final. `ua` is per-site: Eventbrite
 *  answers its own bot UA with a wall, so it gets a browser one. */
async function fetchText(url, ua = UA, attempt = 1) {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": ua, accept: "text/html,application/json" },
      redirect: "follow",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
    return await res.text();
  } catch (error) {
    if (attempt >= MAX_ATTEMPTS || isClientError(error)) throw error;
    await sleep(600 * attempt);
    return fetchText(url, ua, attempt + 1);
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Pull every <script type="application/ld+json"> block out of a page. */
function jsonLdBlocks(html) {
  const blocks = [];
  const re = /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = re.exec(html))) {
    try {
      blocks.push(JSON.parse(match[1].trim()));
    } catch {
      // Malformed block: ignore it rather than failing the whole run.
    }
  }
  return blocks;
}

/** Walk an ld+json blob (which may nest @graph / arrays) and collect nodes. */
function flatten(node, out = []) {
  if (Array.isArray(node)) {
    for (const item of node) flatten(item, out);
    return out;
  }
  if (node && typeof node === "object") {
    if (node["@graph"]) flatten(node["@graph"], out);
    out.push(node);
  }
  return out;
}

const hasType = (node, type) =>
  [].concat(node?.["@type"] ?? []).some((t) => String(t).includes(type));

/** "2026-12-18T12:00:00.000Z" -> "2026-12-18" (and null for junk). */
function isoDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

const ENTITIES = { "&amp;": "&", "&#039;": "'", "&#8217;": "'", "&#8211;": "–", "&quot;": '"', "&#8220;": "“", "&#8221;": "”" };

const decodeEntities = (value) =>
  String(value ?? "").replace(/&amp;|&#039;|&#8217;|&#8211;|&quot;|&#8220;|&#8221;/g, (m) => ENTITIES[m]);

/** Comparison key: "Grand Opening Concert ft. Wizkid" -> "grand opening concert ft wizkid". */
const titleKey = (title) =>
  decodeEntities(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Meaningful words only, for fuzzy matching titles to ticket-page slugs. */
const tokens = (value) =>
  titleKey(value)
    .split(" ")
    .filter((word) => word.length > 2);

/** Words every show at this festival carries, so they prove nothing. */
const GENERIC_WORDS = new Set([
  "detty", "december", "fest", "festival", "lagos", "event", "events", "the", "and",
]);

/** The words that actually identify a show. */
const distinctive = (value) => tokens(value).filter((word) => !GENERIC_WORDS.has(word));

/**
 * Site chrome is sometimes marked up as an Event ("Calendar", "Tickets").
 * Those are navigation, not shows, and must not reach the calendar.
 */
const NOISE_TITLE =
  /^(home|events?|calendar|program(me)?|what'?s on|tickets?|menu|shop|news|about( us)?|contact)$/i;

/**
 * Two vocabularies, and nothing between them: one names a party, the other
 * names any night out. Separating them is what stops a concert being filed as a
 * rave; keeping each as a single list is what stops them drifting apart.
 *
 * Bare "club" is deliberately absent: a book club, polo club or rotary club is
 * a club by name, not a night out. Only the night-club forms count.
 */
const PARTY_WORDS =
  /\b(party|parties|rave|after ?party|day ?party|night ?clubs?|club night|turn ?up|all[ -]?white|all[ -]?black|block party|beach party|pool party|disco|boat (cruise|ride|party)|nightlife|shutdown|vibes?)\b/i;

/** Live music and dancing: a night out, not necessarily a party. */
const NIGHT_OUT_WORDS =
  /\b(dj|dance|music|concert|afrobeats|amapiano|edm|karaoke|live band)\b/i;

const PARTY_TAG_RE = /party|nightlife|social gathering/i;

/**
 * Listings that are not a night out whatever they are tagged: a private
 * wedding, a trade expo, a book club. The party pages carry these because
 * organisers tag loosely, and a section that promises parties cannot pad
 * itself with them.
 */
const NOT_AN_EVENT_RE =
  /\b(wedding|graduation|conference|summit|expo|workshop|seminar|training|church|service|exhibition|book club|reading|things to do in lagos)\b/i;

/**
 * Words that describe a meal, not a night out: a restaurant advert, a potluck.
 * A platform tag cannot rescue these — Eventbrite happily files a grill's promo
 * under "Party or Social Gathering" — so the title has to name a party itself.
 * "Beach BBQ Party" survives; "the best Grilled & Barbeque spot" does not.
 */
const FOOD_ONLY_RE = /\b(picnic|potluck|barbeque|bbq|grill|restaurant)\b/i;

const isShowRow = (event) =>
  Boolean(event?.title) &&
  event.title.trim().length > 2 &&
  !NOISE_TITLE.test(event.title.trim()) &&
  !NOT_AN_EVENT_RE.test(event.title) &&
  !(FOOD_ONLY_RE.test(event.title) && !PARTY_WORDS.test(event.title));

/** Venue/area/city, shared by both adapters. */
const locationOf = (node) => ({
  venue: node?.location?.name ?? null,
  area: node?.location?.address?.addressStreet ?? null,
  city: node?.location?.address?.addressLocality ?? "Lagos",
});

/**
 * Event pages link to several shows (nav, related events). Pick the ticket
 * page whose slug actually matches this event, and none when nothing does —
 * a wrong link is worse than a missing one.
 */
function bestTicketUrl(html, title) {
  const slugs = [
    ...new Set(
      [...html.matchAll(/https:\/\/tix\.dot360\.co\/event\/([a-z0-9-]+)/gi)].map((m) => m[1]),
    ),
  ];
  const wanted = new Set(distinctive(title));
  let best = null;
  let bestScore = 0;

  for (const candidate of slugs) {
    const words = candidate.split("-").filter((word) => word.length > 2);
    const hits = words.filter((word) => wanted.has(word)).length;
    if (hits < 2) continue;

    const precision = hits / words.length;
    if (precision > bestScore) {
      bestScore = precision;
      best = `https://tix.dot360.co/event/${candidate}`;
    }
  }

  return bestScore >= 0.3 ? best : null;
}

const slug = (value) =>
  String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/, "");

/** Two titles can slugify to the same string; ids must stay unique. */
function uniqueId(title, taken) {
  const base = slug(title) || "show";
  if (!taken.has(base)) return base;
  for (let n = 2; ; n += 1) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}

/** Cheapest still-available tier, else cheapest tier, else null. */
function lowestPrice(tiers) {
  const available = tiers.filter((tier) => !tier.soldOut);
  const pool = available.length ? available : tiers;
  const prices = pool.map((tier) => tier.price).filter((price) => Number.isFinite(price));
  return prices.length ? Math.min(...prices) : null;
}

const tiersFrom = (offers) =>
  [].concat(offers ?? [])
    .filter((offer) => offer?.price != null)
    .map((offer) => ({
      name: offer.name ?? "Ticket",
      price: Number(offer.price),
      soldOut: String(offer.availability ?? "").includes("SoldOut"),
    }))
    .filter((tier) => Number.isFinite(tier.price));

/* ------------------------------------------------- Eventbrite destination */

/**
 * Eventbrite answers its own bot UA with a wall, so its pages get a browser UA.
 * Nothing else about the request changes; the data read is the same HTML a
 * visitor's browser receives.
 */
const EVENTBRITE_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

/**
 * Eventbrite ships a destination page's whole result set as one JS object in
 * the HTML (window.__SERVER_DATA__ = {...}). It is not JSON-LD and not an API
 * response, so find the opening brace and walk to its matching close rather
 * than trying to match a 150 KB object with a regex.
 */
function serverData(html) {
  const marker = html.indexOf("__SERVER_DATA__");
  if (marker < 0) return null;
  const open = html.indexOf("{", marker);
  if (open < 0) return null;

  let depth = 0;
  let end = -1;
  let inString = false;
  let escaped = false;

  for (let i = open; i < html.length; i += 1) {
    const char = html[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  if (end < 0) return null;
  try {
    return JSON.parse(html.slice(open, end + 1));
  } catch {
    return null;
  }
}

/**
 * Which side of town a venue is on, from whatever address text the platform
 * gives us. Order matters: "Lekki Phase 1" must be read before "Lekki", and
 * Landmark's Water Corporation Drive is Oniru, not a bare suburb name.
 * A venue we cannot place returns null and stays on the citywide list.
 */
const AREA_HINTS = [
  ["Oniru", /oniru|landmark|water corporation|ozumba/i],
  ["Lekki Phase 1", /lekki phase ?1|admiralty way/i],
  ["Chevron Drive", /chevron/i],
  ["Eleko", /eleko/i],
  ["Ajah", /ajah/i],
  ["Ibeju-Lekki", /ibeju/i],
  ["Sangotedo", /sangotedo/i],
  ["Ikoyi", /ikoyi|banana island|parkview/i],
  ["Victoria Island", /victoria island|\bvi\b/i],
  ["Onikan", /onikan|muson/i],
  ["Lagos Island", /lagos island|marina|\btbs\b/i],
  ["Ikeja", /ikeja|opebi|alausa|allen avenue|agidingbi/i],
  ["Ojota", /ojota/i],
  ["Maryland", /maryland/i],
  ["Yaba", /yaba/i],
  ["Ebute Metta", /ebute[- ]metta/i],
  ["Surulere", /surulere/i],
  ["Apapa", /apapa/i],
  ["Agege", /agege/i],
  ["Ikorodu", /ikorodu/i],
  ["Gbagada", /gbagada/i],
  ["Ogudu", /ogudu/i],
  ["Magodo", /magodo/i],
  ["Ketu", /ketu/i],
  ["Oshodi", /oshodi/i],
  ["Mushin", /mushin/i],
  ["Festac", /festac/i],
  ["Amuwo-Odofin", /amuwo/i],
  ["Ilupeju", /ilupeju/i],
  ["Anthony", /anthony village/i],
  ["Ojodu", /ojodu|berger/i],
  ["Badagry", /badagry/i],
  ["Epe", /\bepe\b/i],
  ["Lekki", /lekki/i],
];

function inferArea(...parts) {
  const text = parts.filter(Boolean).join(" ");
  if (!text.trim()) return null;
  const hit = AREA_HINTS.find(([, pattern]) => pattern.test(text));
  return hit ? hit[0] : null;
}

/**
 * The free-events feed is mostly not nightlife: crypto seminars, embassy
 * sessions, church programmes. A party list padded with those is worse than
 * short, so a free listing has to name a night out before it is kept.
 */
const isNightlifeRow = (title, tags) =>
  [title, ...tags].some(
    (text) => PARTY_WORDS.test(text) || NIGHT_OUT_WORDS.test(text),
  );

/**
 * A party is not a concert with a different poster: it is the thing readers
 * ask for by name, and it gets its own section. The platform's own tags win;
 * the title decides only when they say nothing.
 */
function classifyKind(sourceKind, title, tags) {
  if (tags.some((tag) => PARTY_TAG_RE.test(tag)) || PARTY_WORDS.test(title)) {
    return "party";
  }
  return sourceKind === "party" ? "party" : "show";
}

/**
 * Eventbrite destination listings: name, date, venue, ticket link, tags. No
 * prices — the JSON-LD offer on an event page comes back priced in USD, so a
 * naira figure taken from it would be a guess dressed as a fact. Those events
 * carry no price and the card says the price is unpublished.
 */
/**
 * One page-data row as the calendar's event shape, or null when the row is not
 * a listing this site should carry. Every per-row rule lives here — skipping an
 * online or cancelled listing, the free feed's nightlife gate and the mapping
 * itself — so the paging loop stays about paging.
 */
function eventbriteRow(row, source) {
  const address = row.primary_venue?.address ?? {};
  const tags = (row.tags ?? []).map((tag) => tag.display_name).filter(Boolean);

  if (source.free && !isNightlifeRow(row.name, tags)) return null;

  return {
    title: decodeEntities(row.name).trim(),
    artists: [],
    date: isoDate(row.start_date),
    endDate: isoDate(row.end_date),
    venue: row.primary_venue?.name ?? "Lagos",
    // Title first: organiser addresses are often just "Lagos" while the name
    // says Oshodi or Magodo, and the area filter needs the side of town.
    area: inferArea(
      row.name,
      address.localized_area_display,
      address.address_1,
      address.address_2,
      row.primary_venue?.name,
    ),
    city: "Lagos",
    // No price from Eventbrite: its ticket JSON-LD is priced in USD, and a
    // free-events listing only proves a free ticket exists — a free tier can be
    // an early window, an RSVP list or one of several ticket types. That fact is
    // recorded separately, never as a ₦0 entry price.
    priceFrom: null,
    currency: "NGN",
    // Only the free feed can speak for free tickets: a paid page listing the
    // same show is not evidence its free tier is gone, so it says nothing and
    // merge leaves an existing flag alone.
    ...(source.free ? { freeTicket: true } : {}),
    tiers: [],
    ticketUrl: row.url ?? null,
    source: source.name,
    sourceUrl: source.url,
    kind: classifyKind(source.eventKind, row.name, tags),
    // Every tag is kept: the party decision has to stay auditable, and a cut
    // list could drop the very tag that made it a party.
    tags,
    note: row.summary ? decodeEntities(row.summary).slice(0, 220) : null,
    // Enrichment reads a ticket page for naira prices; Eventbrite's are USD.
    noEnrich: true,
  };
}

/** Page 2+: `?page=2`, or `&page=2` when the listing URL already has a query. */
const eventbritePageUrl = (base, page) =>
  page === 1 ? base : `${base}${base.includes("?") ? "&" : "?"}page=${page}`;

/**
 * `saved` replays pages instead of fetching: page-one HTML as a string, or a
 * Map of URL -> HTML when more than one page is needed. A page missing from the
 * map is an empty page, never a network call.
 */
async function eventbriteEvents(source, saved = null) {
  const events = [];
  const seen = new Set();
  const maxPages = source.maxPages ?? 1;
  const replaying = saved != null;

  for (let page = 1; page <= maxPages; page += 1) {
    const url = eventbritePageUrl(source.url, page);
    const body = !replaying
      ? await fetchText(url, EVENTBRITE_UA)
      : typeof saved === "string"
        ? page === 1
          ? saved
          : ""
        : (saved.get(url) ?? "");
    const data = serverData(body);
    const listing = data?.search_data?.events;
    const results = listing?.results ?? [];
    if (results.length === 0) {
      console.warn(`  ! ${source.name} page ${page}: no results in page data`);
      break;
    }

    if (!replaying) {
      console.log(
        `  ${source.name} page ${page}: ${results.length} of ${listing.pagination?.object_count ?? "?"}`,
      );
    }

    for (const row of results) {
      if (!row?.name || row.is_online_event || row.is_cancelled) continue;
      if (seen.has(row.eid)) continue;
      seen.add(row.eid);

      const event = eventbriteRow(row, source);
      if (event) events.push(event);
    }

    const pageCount = listing.pagination?.page_count ?? page;
    if (page >= pageCount) break;
    await sleep(400);
  }

  return events;
}

/* --------------------------------------------------------------- adapters */

/**
 * Detty December Fest publishes an ItemList of Event objects on /events/,
 * but not the ticket link. The link lives on each WordPress event page, so
 * we build a title -> ticket URL map first, then enrich from the ticket page.
 */
async function dettyTicketMap(source) {
  const map = new Map();
  if (!source.wpApi) return map;

  const rows = JSON.parse(
    await fetchText(`${source.wpApi}/ddf_event?per_page=100&_fields=title,link`),
  );
  if (!Array.isArray(rows)) throw new Error(`unexpected WP payload from ${source.wpApi}`);

  for (const row of rows) {
    const title = row?.title?.rendered ?? "";
    if (!title || !row.link) continue;
    try {
      const ticketUrl = bestTicketUrl(await fetchText(row.link), title);
      if (ticketUrl) map.set(titleKey(title), ticketUrl);
    } catch (error) {
      console.warn(`  ! could not read ${row.link}: ${error.message}`);
    }
    await sleep(120);
  }
  return map;
}

async function dettyEvents(source, ticketMap, html = null) {
  const page = html ?? (await fetchText(source.url));
  const events = [];

  for (const block of jsonLdBlocks(page)) {
    for (const node of flatten(block)) {
      if (!hasType(node, "ItemList")) continue;
      for (const entry of node.itemListElement ?? []) {
        const event = entry?.item ?? entry;
        if (!event || !hasType(event, "Event") || !event.name) continue;
        events.push({
          title: decodeEntities(event.name),
          artists: [],
          date: isoDate(event.startDate),
          endDate: isoDate(event.endDate),
          ...locationOf(event),
          priceFrom: null,
          currency: "NGN",
          tiers: [],
          ticketUrl: ticketMap.get(titleKey(event.name)) ?? null,
          source: source.name,
          sourceUrl: source.url,
          kind: PARTY_WORDS.test(event.name) ? "party" : "show",
          note: event.description?.slice(0, 220) ?? null,
        });
      }
    }
  }
  return events;
}

/** Any page with schema.org Event data: read name, date, venue, offers. */
async function jsonLdEvents(source, html = null) {
  const page = html ?? (await fetchText(source.url));
  const events = [];

  for (const node of jsonLdBlocks(page).flatMap((block) => flatten(block))) {
    if (!hasType(node, "Event") || !node.name) continue;
    const offers = [].concat(node.offers ?? []);
    const tiers = tiersFrom(offers);

    events.push({
      title: decodeEntities(node.name),
      artists: [].concat(node.performer ?? []).map((performer) => performer.name).filter(Boolean),
      date: isoDate(node.startDate),
      endDate: isoDate(node.endDate),
      ...locationOf(node),
      priceFrom: lowestPrice(tiers),
      currency: offers[0]?.priceCurrency ?? "NGN",
      tiers,
      // An offer URL is a ticket link; the article itself is not.
      ticketUrl: offers[0]?.url ?? null,
      source: source.name,
      sourceUrl: source.url,
      kind: PARTY_WORDS.test(node.name) ? "party" : "show",
      note: null,
    });
  }
  return events;
}

/** Read the price tiers off a ticket page, and its more precise venue. */
async function enrichFromTicket(event) {
  if (!event.ticketUrl) return event;
  try {
    const html = await fetchText(event.ticketUrl);
    const nodes = jsonLdBlocks(html).flatMap((block) => flatten(block));
    const node = nodes.find((candidate) => hasType(candidate, "Event") && candidate.offers);
    if (!node) return event;

    // Guard: if the ticket page is for a different show, leave the event alone.
    const wanted = new Set(distinctive(event.title));
    const matches = tokens(node.name).filter((word) => wanted.has(word)).length;
    if (matches < 2) return event;

    const tiers = tiersFrom(node.offers);

    return {
      ...event,
      venue: node.location?.name ?? event.venue,
      // The festival calendar is the source of truth for dates; the ticket
      // page only fills a date in when the calendar had none.
      date: event.date ?? isoDate(node.startDate),
      endDate: event.endDate ?? isoDate(node.endDate),
      tiers,
      priceFrom: lowestPrice(tiers),
      currency: node.offers?.[0]?.priceCurrency ?? event.currency,
    };
  } catch (error) {
    console.warn(`  ! could not read ticket page ${event.ticketUrl}: ${error.message}`);
    return event;
  }
}

/** A deleted event usually announces itself in the heading, not the status. */
const MISSING_RE =
  /\bnot found\b|\b404\b|no longer (available|exists|on sale)|page (doesn't|does not) exist|event (has )?ended|been removed/i;

/**
 * Is this ticket page still there? A page that is gone (404/410, a heading
 * saying the event is missing — some platforms answer 200 for a deleted
 * event — or a host that no longer resolves) gets marked so the site stops
 * linking it. Bot walls and server trouble (403, 429, 5xx, timeouts) prove
 * nothing either way, so they return null and the previous mark stays.
 */
async function ticketLinkStatus(url) {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (res.status === 404 || res.status === 410) return "dead";
    if (!res.ok) return null;

    const html = await res.text();
    const heading = [
      /<title[^>]*>([\s\S]*?)<\/title>/i,
      /<h1[^>]*>([\s\S]*?)<\/h1>/i,
    ]
      .map((re) => html.match(re)?.[1] ?? "")
      .join(" ");
    const text = decodeEntities(heading.replace(/<[^>]+>/g, " "))
      .replace(/\s+/g, " ")
      .trim();

    return MISSING_RE.test(text) ? "dead" : "ok";
  } catch (error) {
    // Only a host that does not resolve proves the page is gone. A timeout or
    // a dropped connection says nothing about the event, and a flaky network
    // must not mark half the parties as cancelled.
    const code = error?.cause?.code ?? error?.code ?? "";
    if (code === "ENOTFOUND") return "dead";
    return null;
  }
}

/* ------------------------------------------------------------------ merge */

function mergeEvents(existing, incoming) {
  const byTitle = new Map(existing.map((event) => [titleKey(event.title), event]));
  const takenIds = new Set(existing.map((event) => event.id));
  const added = [];
  const updated = [];

  for (const fresh of incoming) {
    if (!fresh.date) continue; // a show with no date cannot be listed
    const current = byTitle.get(titleKey(fresh.title));

    if (!current) {
      const id = uniqueId(fresh.title, takenIds);
      takenIds.add(id);
      const record = { id, ...fresh };
      byTitle.set(titleKey(fresh.title), record);
      added.push(record);
      continue;
    }

    const before = JSON.stringify(current);
    // Scraped facts win; hand-written fields (artists, notes) are preserved.
    for (const field of [
      "date",
      "endDate",
      "venue",
      "area",
      "city",
      "ticketUrl",
      "sourceUrl",
      "source",
      "kind",
      "tags",
    ]) {
      if (fresh[field]) current[field] = fresh[field];
    }
    if (fresh.tiers.length) {
      current.tiers = fresh.tiers;
      current.priceFrom = fresh.priceFrom;
      current.currency = fresh.currency;
    } else if (fresh.priceFrom != null && current.priceFrom == null) {
      // A source that states a price can fill one we did not have.
      current.priceFrom = fresh.priceFrom;
      current.currency = fresh.currency;
    }
    // The free-events feed answers for itself: a free ticket exists only while
    // a listing carries one, so a removed free tier does not linger.
    if ("freeTicket" in fresh) {
      if (fresh.freeTicket) current.freeTicket = true;
      else delete current.freeTicket;
    }
    if (JSON.stringify(current) !== before) updated.push(current);
  }

  return { events: [...byTitle.values()], added, updated };
}

/** Refuse to write a file the site cannot render. */
function assertWritable(events) {
  const problems = events.filter(
    (event) =>
      !event.id ||
      !event.title ||
      !DATE_RE.test(event.date ?? "") ||
      (event.endDate && !DATE_RE.test(event.endDate)),
  );
  if (problems.length > 0) {
    throw new Error(
      `${problems.length} event(s) missing id/title/date — refusing to write`,
    );
  }
}

/* ------------------------------------------------------------------- main */

async function main() {
  const sources = JSON.parse(await readFile(SOURCES_FILE, "utf8"));
  const data = JSON.parse(await readFile(DATA_FILE, "utf8"));
  // The window moves with the calendar. Pinned to a calendar year it would cut
  // off anything announced for January, and pinned to December it would throw
  // away every other month, so it rolls forward from today instead.
  const windowEnd = addDays(today(), WINDOW_DAYS);

  console.log(`Refreshing shows, keeping dates through ${windowEnd}`);

  const feedSources = sources.sources ?? [];
  const watchlist = sources.watchlist ?? [];
  const total = feedSources.length + watchlist.length;

  let scraped = [];
  let failed = 0;
  const health = [];

  for (const source of feedSources) {
    try {
      const events =
        source.kind === "detty"
          ? await dettyEvents(source, await dettyTicketMap(source))
          : source.kind === "eventbrite"
            ? await eventbriteEvents(source)
            : await jsonLdEvents(source);
      const usable = events.filter(isShowRow);
      console.log(`  ${source.name}: ${usable.length} event(s)`);
      health.push({ name: source.name, ok: true, events: usable.length, error: null });
      scraped = scraped.concat(usable);
    } catch (error) {
      failed += 1;
      health.push({ name: source.name, ok: false, events: 0, error: error.message });
      console.error(`  ! ${source.name} failed: ${error.message}`);
    }
  }

  for (const url of watchlist) {
    try {
      const events = await jsonLdEvents({ name: new URL(url).hostname, url });
      const usable = events.filter(isShowRow);
      console.log(`  watchlist ${url}: ${usable.length} event(s)`);
      health.push({
        name: new URL(url).hostname,
        ok: true,
        events: usable.length,
        error: null,
      });
      scraped = scraped.concat(usable);
    } catch (error) {
      failed += 1;
      health.push({
        name: new URL(url).hostname,
        ok: false,
        events: 0,
        error: error.message,
      });
      console.error(`  ! watchlist ${url} failed: ${error.message}`);
    }
  }

  // Health is worth keeping even when the shows themselves did not change:
  // a source that failed this run is the first sign of a stale calendar.
  if (!DRY_RUN) {
    await writeFile(
      STATUS_FILE,
      `${JSON.stringify({ checkedAt: new Date().toISOString(), sources: health }, null, 2)}\n`,
      "utf8",
    );
  }

  if (scraped.length === 0) {
    console.error(
      `No events scraped from ${total} source(s) (${failed} failed) — leaving the data untouched.`,
    );
    process.exitCode = 1;
    return;
  }

  const enriched = [];
  for (const event of scraped) {
    if (event.noEnrich) {
      const { noEnrich, ...rest } = event;
      enriched.push(rest);
      continue;
    }
    enriched.push(await enrichFromTicket(event));
    await sleep(120);
  }

  const { events, added, updated } = mergeEvents(data.events ?? [], enriched);

  // Drop anything that has finished, and anything past the window.
  const cutoff = today();
  const kept = events
    .filter((event) => (event.endDate ?? event.date) >= cutoff)
    .filter((event) => event.date <= windowEnd)
    // Also clears non-parties a previous run let in, e.g. a wedding listing.
    .filter(isShowRow)
    .sort((a, b) => a.date.localeCompare(b.date));

  const dropped = events.length - kept.length;

  // A show that has simply finished is expected, not an error: after the last
  // night every listed event is past, and the job still has to run. What must
  // not pass silently is a live show disappearing because a source broke, so
  // only upcoming events are counted here.
  const keptIds = new Set(kept.map((event) => event.id));
  const lostUpcoming = (data.events ?? []).filter(
    (event) => (event.endDate ?? event.date) >= cutoff && !keptIds.has(event.id),
  );

  if (!ALLOW_DROP && lostUpcoming.length > MAX_DROPPED) {
    console.error(
      `Refusing to write: ${lostUpcoming.length} upcoming event(s) would disappear ` +
        `(limit ${MAX_DROPPED}). A source may have failed or truncated — ` +
        "re-run with --allow-drop if those events really are over.",
    );
    process.exitCode = 1;
    return;
  }

  // Ticket links rot quietly, so check them before deciding nothing changed:
  // a dead link on its own is enough to justify a write. Copies, not the
  // originals, because those objects are the ones we diff against.
  let deadLinks = 0;
  const verified = [];
  for (const event of kept) {
    const next = { ...event };
    if (!event.ticketUrl) {
      delete next.ticketStatus;
    } else {
      const status = await ticketLinkStatus(event.ticketUrl);
      if (status) {
        next.ticketStatus = status;
        if (status === "dead") {
          deadLinks += 1;
          console.log(`  × dead ticket link: ${event.title} — ${event.ticketUrl}`);
        }
      }
      await sleep(120);
    }
    verified.push(next);
  }

  const changed = JSON.stringify(verified) !== JSON.stringify(data.events ?? []);

  console.log(
    `  ${scraped.length} scraped, ${failed}/${total} source(s) failed, ` +
      `added ${added.length}, updated ${updated.length}, dropped ${dropped}, ` +
      `${deadLinks} dead ticket link(s)`,
  );
  for (const event of added) console.log(`    + ${event.date}  ${event.title}`);

  if (!changed) {
    console.log("No changes — nothing written.");
    return;
  }

  assertWritable(verified);

  const next = {
    ...data,
    updatedAt: new Date().toISOString(),
    window: { from: cutoff, to: windowEnd },
    events: verified,
  };

  if (DRY_RUN) {
    console.log("Dry run — not writing data/shows.json");
    return;
  }

  await writeFile(DATA_FILE, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  console.log(`Wrote ${verified.length} events to data/shows.json`);
}

export {
  classifyKind,
  dettyEvents,
  eventbriteEvents,
  eventbritePageUrl,
  inferArea,
  isNightlifeRow,
  isShowRow,
  jsonLdEvents,
  locationOf,
  mergeEvents,
  serverData,
};

const isDirectRun =
  Boolean(process.argv[1]) &&
  path.basename(process.argv[1]) === path.basename(fileURLToPath(import.meta.url));

if (isDirectRun) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
