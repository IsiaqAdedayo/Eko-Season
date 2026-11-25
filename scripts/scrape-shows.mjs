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
const UA = "LagosGuideShowsBot/1.0 (event listing refresher for Eko Season)";
const REQUEST_TIMEOUT_MS = 25_000;
const MAX_ATTEMPTS = 2;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const today = () => new Date().toISOString().slice(0, 10);

/* ------------------------------------------------------------------ utils */

const isClientError = (error) => /^4\d\d /.test(String(error?.message ?? ""));

/** One retry for timeouts and 5xx; 4xx is final. */
async function fetchText(url, attempt = 1) {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "text/html,application/json" },
      redirect: "follow",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
    return await res.text();
  } catch (error) {
    if (attempt >= MAX_ATTEMPTS || isClientError(error)) throw error;
    await sleep(600 * attempt);
    return fetchText(url, attempt + 1);
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

const isShowRow = (event) =>
  Boolean(event?.title) &&
  event.title.trim().length > 2 &&
  !NOISE_TITLE.test(event.title.trim());

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
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 70);

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
    if (error?.name === "TimeoutError") return null;
    return "dead"; // DNS failure or refused connection: the page is not there
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
    for (const field of ["date", "endDate", "venue", "area", "city", "ticketUrl", "sourceUrl", "source"]) {
      if (fresh[field]) current[field] = fresh[field];
    }
    if (fresh.tiers.length) {
      current.tiers = fresh.tiers;
      current.priceFrom = fresh.priceFrom;
      current.currency = fresh.currency;
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
  // The window moves with the calendar. Pinning it to the season in the data
  // file would mean a January run silently discarding the next December.
  const windowEnd = `${today().slice(0, 4)}-12-31`;

  console.log(`Refreshing shows, window ends ${windowEnd}`);

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
    enriched.push(await enrichFromTicket(event));
    await sleep(120);
  }

  const { events, added, updated } = mergeEvents(data.events ?? [], enriched);

  // Drop anything that has finished, and anything past the window.
  const cutoff = today();
  const kept = events
    .filter((event) => (event.endDate ?? event.date) >= cutoff)
    .filter((event) => event.date <= windowEnd)
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

export { dettyEvents, isShowRow, jsonLdEvents, locationOf, mergeEvents };

const isDirectRun =
  Boolean(process.argv[1]) &&
  path.basename(process.argv[1]) === path.basename(fileURLToPath(import.meta.url));

if (isDirectRun) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
