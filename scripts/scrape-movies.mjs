#!/usr/bin/env node
/**
 * Lagos movies refresh job.
 *
 *   1. Reads data/movie-sources.json for cinema and release-tracker URLs.
 *   2. Scrapes movie releases (title, date, platform, cinema venue, ticket/source URL).
 *   3. Merges into data/movies.json: new movies appended, known movies updated,
 *      old movies that have finished their run are dropped.
 *   4. Writes only when something changed.
 *   5. Refuses to write an empty slate: if every date on file is in the past,
 *      the source list is last month's page and the run fails loudly instead of
 *      blanking /movies. check:health starts failing ten days before that.
 *
 * Run: node scripts/scrape-movies.mjs [--dry-run]
 *
 * Sources worth keeping:
 *   - NaijaSabi "h2 list" — canonical four-film slate for the month the page
 *     names, with
 *     cinema vs Netflix tags. This is the best current source; we parse both
 *     the summary table and the section headings so the scraper keeps working
 *     if only one form is present.
 *   - African Movie Database — same four films on a cleaner "Release date: …
 *     / Platform: …" layout. Worth keeping as a corroborating source, but drop it
 *     if it stops returning structured data.
 *   - Silverbird — currently HTTP 200 but returning no film blocks. Keep it in
 *   the rotation as a live check (it is the venue the site lists), but do not
 *   treat an empty scrape as an error; only fail loudly on a real fetch error.
 *   - Nollywood Reporter — worth keeping in sources.json because it sometimes
 *   carries Detty December venue/date extras, but the current generic tracker
 *   parser is not strong enough to read it reliably. Keep it as a watchlist
 *   entry; if a run returns nothing useful for two consecutive runs, drop it
 *   from sources.json rather than trying to maintain a bespoke parser.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_FILE = path.join(ROOT, "data/movies.json");
const SOURCES_FILE = path.join(ROOT, "data/movie-sources.json");
/** Per-source health from the last run, read by the /movies page. */
const STATUS_FILE = path.join(ROOT, "data/movie-source-status.json");

const DRY_RUN = process.argv.includes("--dry-run");
/**
 * Replay the saved NaijaSabi page instead of fetching it:
 *   node scripts/scrape-movies.mjs --from-file=data/naijasabi-live-2026-12.html
 * data/naijasabi-live-2026-12.html is the kept snapshot of the December 2026
 * page, used to check the table/heading parsers without the network.
 */
const FROM_FILE = (() => {
  const arg = process.argv.find((a) => a.startsWith("--from-file="));
  return arg ? path.resolve(ROOT, arg.slice("--from-file=".length)) : null;
})();
const UA = "EkoseasonMoviesBot/1.0 (Lagos cinema listing refresher)";
const REQUEST_TIMEOUT_MS = 20_000;
const MAX_ATTEMPTS = 2;
const today = () => new Date().toISOString().slice(0, 10);

/* ------------------------------------------------------------------ fetch */

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
    if (attempt >= MAX_ATTEMPTS) throw error;
    await sleep(600 * attempt);
    return fetchText(url, attempt + 1);
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ------------------------------------------------------------------ escape */

const esc = (s) =>
  String(s ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/&quot;/g, '"')
    .replace(/&#8220;/g, "\u201c")
    .replace(/&#8221;/g, "\u201d")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&hellip;/g, "\u2026")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();

/** Visible text of an HTML fragment: tags and extra whitespace removed. */
const stripTags = (s) =>
  String(s ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Text of an HTML fragment with entities decoded. */
const textOf = (frag) => esc(stripTags(frag));

/* ------------------------------------------------------------------ dates */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const MONTHS = {
  january: "01", february: "02", march: "03", april: "04",
  may: "05", june: "06", july: "07", august: "08",
  september: "09", october: "10", november: "11", december: "12",
  // Abbreviations, because listings switch between "December 4" and "4 Dec".
  jan: "01", feb: "02", mar: "03", apr: "04", jun: "06", jul: "07",
  aug: "08", sep: "09", sept: "09", oct: "10", nov: "11", dec: "12",
};
const MONTH_NAMES = Object.keys(MONTHS).join("|");
const DAY_MONTH_RE = new RegExp(`^(\\d{1,2})\\s+(${MONTH_NAMES})(?:,?\\s+\\d{4})?$`, "i");
const MONTH_DAY_RE = new RegExp(`^(${MONTH_NAMES})\\s+(\\d{1,2})(?:,?\\s+\\d{4})?$`, "i");
const WEEKDAY_PREFIX = /^(?:mon|tue|wed|thu|fri|sat|sun)[a-z]*\.?,?\s+/i;

/**
 * ISO date from a NaijaSabi / AMDB style date string.
 *
 * Accepts "December 4, 2026", "4 December 2026", "Friday 4 December",
 * "2026-12-04" and "Release date: December 4, 2026".
 *
 * NaijaSabi's table drops the year ("Friday 4 December"); those fall back to
 * `defaultYear`, i.e. the year the source page is about.
 */
function parseDate(raw, defaultYear) {
  if (!raw) return null;

  const text = String(raw)
    .replace(/\s+/g, " ")
    .replace(/^release date\s*:\s*/i, "")
    .replace(WEEKDAY_PREFIX, "")
    .trim();

  if (DATE_RE.test(text)) return text;

  const year = text.match(/\b(\d{4})\b/)?.[1] ?? String(defaultYear ?? new Date().getUTCFullYear());

  // "4 December" / "4 December 2026"
  let m = text.match(DAY_MONTH_RE);
  if (m) return `${year}-${MONTHS[m[2].toLowerCase()]}-${m[1].padStart(2, "0")}`;

  // "December 4" / "December 4, 2026"
  m = text.match(MONTH_DAY_RE);
  if (m) return `${year}-${MONTHS[m[1].toLowerCase()]}-${m[2].padStart(2, "0")}`;

  return null;
}

/** Year a source page is about, e.g. "March 2027" in its headline. */
function pageYear(html) {
  const m = String(html).match(
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b/i,
  );
  return m ? m[1] : new Date().getUTCFullYear();
}

/* ------------------------------------------------------------------ ids / slugs */

const slug = (value) =>
  String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 70);

function uniqueId(title, taken) {
  const base = slug(title) || "movie";
  if (!taken.has(base)) return base;
  for (let n = 2; ; n += 1) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}

const trimLeadingNumber = (title) =>
  String(title).replace(/^\s*\d+\.\s*/, "").trim();

/** "Nigerian cinemas", "Cinemas", "Netflix", etc. -> "cinema" | "netflix". */
function platformFromWhere(raw) {
  if (!raw) return null;
  const t = String(raw).toLowerCase();
  if (/netflix/i.test(t)) return "netflix";
  if (/cinema/i.test(t) || /\btheatres?\b/i.test(t)) return "cinema";
  return null;
}

/* ------------------------------------------------------------------ extractors */

/**
 * NaijaSabi "h2 list" extractor.
 *
 * The page's release-calendar table is the canonical December 2026 schedule:
 *
 *   ## December 2026 Release Calendar
 *   | Date | Title | Where | Filmmaker |
 *   | Friday 4 December | The Secret Lives of Baba Segi’s Wives | Nigerian cinemas (rest of the world from 11 December) | EbonyLife Films; directed by Daniel Oriahi |
 *   | Friday 4 December | Jagun Jagun 2: War of Warriors | Netflix | Produced by Femi Adebayo |
 *   | Friday 11 December | The Four: No One Fights Alone | Cinemas (distributed by FilmOne) | Funke Akindele |
 *   | Wednesday 16 December | Bestie | Cinemas nationwide (distributed by FilmOne) | Toyin Abraham |
 *
 * The headings after that repeat the same four films as section titles:
 *
 *   ## The Secret Lives of Baba Segi's Wives (4 December, cinemas)
 *   ## Jagun Jagun 2: War of Warriors (4 December, Netflix)
 *   ## The Four: No One Fights Alone (11 December, cinemas)
 *   ## Bestie (16 December, cinemas)
 *
 * We prefer the table because it gives the date + platform in one place, but
 * fall back to the section headings when it is absent or unparseable.
 */
function parseNaijaSabi(html) {
  const events = [];
  const year = pageYear(html);

  // Table form: prefer it because it is the most structured representation.
  const tableRows = html.match(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi) ?? [];
  for (const row of tableRows) {
    const cells = row.match(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi) ?? [];
    if (cells.length < 3) continue;

    const dateRaw = textOf(cells[0]);
    const titleRaw = textOf(cells[1]);
    const whereRaw = textOf(cells[2]);

    if (!dateRaw || !titleRaw) continue;
    if (/^date$/i.test(dateRaw)) continue; // header row

    const title = normalizeFilmTitle(titleRaw);
    if (!title) continue;

    const date = parseDate(dateRaw, year);
    if (!date) continue;

    const platform = platformFromWhere(whereRaw) ?? "cinema";

    events.push({
      title,
      date,
      endDate: null,
      cinemas: platform === "cinema"
        ? [{ name: "Silverbird Galleria", area: "Victoria Island", url: "https://silverbirdcinemas.com/cinema/galleria/" }]
        : [],
      platform,
      source: "NaijaSabi",
      sourceUrl: "https://naijasabi.com.ng/nollywood-christmas-movies-december-2026-cinema-release-dates/",
      venueIds: platform === "cinema" ? ["silverbird-galleria"] : [],
    });
  }

  // Section-heading form: same four films, just phrased as headings.
  if (events.length === 0) {
    const sectionHeads = html.match(/<h[12]\b[^>]*>([\s\S]*?)<\/h[12]>/gi) ?? [];
    for (const h of sectionHeads) {
      const m = textOf(h)
        .replace(/[’‘]/g, "'")
        .match(
          /^(The Secret Lives of Baba Segi(?:'s Wives)?|Jagun Jagun 2: War of Warriors|The Four: No One Fights Alone|Bestie)\s*\((\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December),?\s*([^)]+)\)$/i,
        );
      if (!m) continue;

      const platform = platformFromWhere(m[4]);
      if (!platform) continue;

      const date = parseDate(`${m[2]} ${m[3]}`, year);
      if (!date) continue;

      events.push({
        title: m[1],
        date,
        endDate: null,
        cinemas: platform === "cinema"
          ? [{ name: "Silverbird Galleria", area: "Victoria Island", url: "https://silverbirdcinemas.com/cinema/galleria/" }]
          : [],
        platform,
        source: "NaijaSabi",
        sourceUrl: "https://naijasabi.com.ng/nollywood-christmas-movies-december-2026-cinema-release-dates/",
        venueIds: platform === "cinema" ? ["silverbird-galleria"] : [],
      });
    }
  }

  return events;
}

/** "The Secret Lives of Baba Segi’s Wives" (with / without apostrophe form). */
function normalizeFilmTitle(title) {
  let t = String(title).trim();
  t = t.replace(/’/g, "'").replace(/‘/g, "'");
  return t;
}

/**
 * African Movie Database extractor.
 *
 * Page is server-rendered with the full article in a `data-page` JSON blob.
 * That blob contains `blog.contentHtml` with stable paragraphs like:
 *
 *   <h2>Release date: December 4, 2026</h2>
 *   <p>Platform: Nigerian cinemas</p>
 *
 * and
 *
 *   <h2><strong>4. Bestie</strong></h2>
 *   <p>Release date: December 16, 2026</p>
 *   <p>Platform: Nigerian cinemas</p>
 *
 * We pull (title, date, platform) pairs out of that structured article,
 * ignoring the surrounding boilerplate. If the data-page blob is absent or
 * unparseable, we fall back to the injected server-rendered markup, which is
 * just contentHtml wrapped in plain paragraphs.
 */
function parseAMDB(html) {
  const events = [];

  // The data-page blob is the best source; it is embedded as a <script>.
  let articleHtml = null;
  let scriptMatch;
  const scriptRe = /<script[^>]*\bdata-page\b[^>]*>([\s\S]*?)<\/script>/gi;
  while ((scriptMatch = scriptRe.exec(html))) {
    const payload = scriptMatch[1];
    // AMDB stores contentHtml as a JSON string inside the data-page JSON.
    let contentHtml = null;
    try {
      const page = JSON.parse(payload);
      const htmlField =
        page?.props?.blog?.contentHtml ??
        (typeof page === "object" && page !== null ? page.contentHtml : undefined);
      if (typeof htmlField === "string" && htmlField.length > 0) contentHtml = htmlField;
    } catch {}
    if (contentHtml) {
      articleHtml = contentHtml;
      break;
    }
  }

  // Fallback: the injected server-rendered markup is just contentHtml wrapped
  // in plain paragraphs, so parse that too.
  const target = articleHtml ?? html;

  // Each film is a <h2> followed by a "Release date:" line and a
  // "Platform:" line. Walk the article and pair them up.
  const blocks = splitIntoSections(target);
  for (const block of blocks) {
    const title = sectionTitle(block);
    if (!title) continue;

    const date = findFirst(block, /Release date\s*:\s*(.+)/i);
    if (!date) continue;

    const platformRaw = findFirst(block, /Platform\s*:\s*(.+)/i);
    const platform = platformFromWhere(platformRaw);
    if (!platform) continue;

    const isoDate = parseDate(date);
    if (!isoDate) continue;

    events.push({
      title: trimLeadingNumber(title),
      date: isoDate,
      endDate: null,
      cinemas: platform === "cinema"
        ? [{ name: "Silverbird Galleria", area: "Victoria Island", url: "https://silverbirdcinemas.com/cinema/galleria/" }]
        : [],
      platform,
      source: "African Movie Database",
      sourceUrl: "https://africanmoviedb.com/news/upcoming-nigerian-movies-releasing-in-december-2026",
      venueIds: platform === "cinema" ? ["silverbird-galleria"] : [],
    });
  }

  return events;
}

/** Split the AMDB content into per-film sections. */
function splitIntoSections(html) {
  return html
    .split(/(?=<h[12]\b)/i)
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Title of a section: the text inside the first <h1>/<h2> of the block. */
function sectionTitle(block) {
  const m = block.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/i);
  if (!m) return null;
  // AMDB section titles embed <strong>...</strong>; pull the visible text.
  return textOf(m[1]);
}

/**
 * First occurrence of a regex within a chunk of HTML-ish text, as visible text.
 * Stripping tags before the caller parses matters: a captured "December 11,
 * 2026</p>" is not a date.
 */
function findFirst(chunk, re) {
  const m = chunk.match(re);
  return m ? textOf(m[1]) : null;
}

/**
 * Silverbird "now showing / coming soon" extractor.
 *
 * Keep watching it because the site is the venue the Ekó Season guide lists,
 * but only keep it as a live check: an empty result is not an error, only a
 * real fetch failure is.
 */
function parseFromSilverbird(html) {
  const events = [];
  const blocks = splitIntoSections(html);
  for (const block of blocks) {
    const title = sectionTitle(block);
    if (!title) continue;

    const releaseRaw = findFirst(block, /Release\s*:\s*(.+)/i);
    if (!releaseRaw) continue;

    const date = parseDate(releaseRaw);
    if (!date) continue;

    const platform = platformFromWhere(releaseRaw) ?? "cinema";
    events.push({
      title: trimLeadingNumber(title),
      date,
      endDate: null,
      cinemas: platform === "cinema"
        ? [{ name: "Silverbird Galleria", area: "Victoria Island", url: "https://silverbirdcinemas.com/cinema/galleria/" }]
        : [],
      platform,
      source: "Silverbird Cinemas",
      sourceUrl: "https://silverbirdcinemas.com/cinema/galleria/",
      venueIds: platform === "cinema" ? ["silverbird-galleria"] : [],
    });
  }
  return events;
}

/**
 * Generic tracker fallback for any watchlisted URL that is not NaijaSabi or
 * AMDB. Weak: only extracts a (title, iso date) pair. Do not add new sources
 * here without a bespoke parser; keep such sources in movie-sources.json only
 * if you are prepared to write or improve the parser.
 */
function parseGenericTracker(html, entry) {
  const events = [];
  const blocks = splitIntoSections(html);
  for (const block of blocks) {
    const title = sectionTitle(block);
    if (!title) continue;

    const date = findFirst(block, /(\d{4}-\d{2}-\d{2})/);
    if (!date) continue;

    const isoDate = parseDate(date);
    if (!isoDate) continue;

    events.push({
      title: trimLeadingNumber(title),
      date: isoDate,
      endDate: null,
      cinemas: [{ name: entry.name, area: "Victoria Island", url: entry.url }],
      platform: "cinema",
      source: entry.name,
      sourceUrl: entry.url,
      venueIds: ["silverbird-galleria"],
    });
  }
  return events;
}

/* ------------------------------------------------------------------ merge */

function mergeEvents(existing, incoming) {
  const byTitle = new Map(existing.map((m) => [slug(m.title), m]));
  const takenIds = new Set(existing.map((m) => m.id));
  const added = [];

  for (const fresh of incoming) {
    if (!fresh.date) continue;
    const current = byTitle.get(slug(fresh.title));
    if (!current) {
      const id = uniqueId(fresh.title, takenIds);
      takenIds.add(id);
      const record = { id, ...fresh };
      byTitle.set(slug(fresh.title), record);
      added.push(record);
      continue;
    }

    // Update date/venue/source if the scraped version is newer or more complete.
    if (!current.date || (fresh.date && fresh.date > current.date)) {
      current.date = fresh.date;
    }
    if (!current.platform && fresh.platform) current.platform = fresh.platform;
    if (!current.note && fresh.note) current.note = fresh.note;
    if (!current.sourceUrl) current.sourceUrl = fresh.sourceUrl;

    // If the source now gives a clearer venue list for cinema releases,
    // prefer the richer list.
    if (fresh.platform === "cinema" && fresh.cinemas && fresh.cinemas.length) {
      if (!current.cinemas || !current.cinemas.length) {
        current.cinemas = fresh.cinemas;
        current.venueIds = fresh.venueIds;
      }
    }
  }

  return { events: [...byTitle.values()], added };
}

function assertWritable(events) {
  const problems = events.filter(
    (m) => !m.id || !m.title || !DATE_RE.test(m.date ?? ""),
  );
  if (problems.length > 0) {
    throw new Error(`${problems.length} movie(s) missing id/title/date — refusing to write`);
  }
}

/**
 * Keep only rows that look like real films, not scraped page boilerplate.
 *
 * A useful film row has a real title, a real ISO date, and is dated
 * somewhere reasonable (not today’s scrape timestamp, not the far future).
 *
 * Generic tracker fallbacks in particular can produce junk like the page
 * headline or a near-date phrase; this filter drops those before merge.
 */
function isFilmRow(row) {
  if (!row || !row.title || !DATE_RE.test(row.date ?? "")) return false;

  const title = String(row.title).trim();
  if (title.length < 3) return false;
  if (/^\d+$/.test(title)) return false;
  // Silverbird generic fallbacks sometimes emit the venue name as the title.
  if (/silverbird/i.test(title) && !/\b(the|an?|of|for|with|and|or|in|on|at|to)\b/i.test(title)) return false;
  // Generic trackers can grab the article headline; drop anything that is
  // obviously a list/guide title rather than a single film.
  if (/\b(detty\s*december|guide|calendar|releases?|upcoming|latest|news|malumfashi|lagos|lifestyle)\b/i.test(title) && !/\./.test(title)) return false;

  // The guide is about an upcoming season, so future release dates are normal;
  // only stale listings and mis-parsed years fall outside a year back / two
  // years ahead. ISO dates compare correctly as strings.
  const yearMs = 365 * 86_400_000;
  const oldest = new Date(Date.now() - yearMs).toISOString().slice(0, 10);
  const newest = new Date(Date.now() + 2 * yearMs).toISOString().slice(0, 10);
  return row.date >= oldest && row.date <= newest;
}

/**
 * How far the release calendar actually reaches.
 *
 * The point of this helper is to tell "no films have been announced" apart from
 * "the pages in movie-sources.json are last month's": December's articles keep
 * parsing perfectly in January, so a successful scrape is no evidence the slate
 * is current. `daysLeft` is negative once the last release is in the past.
 */
export function slateEnd(
  events,
  today = new Date().toISOString().slice(0, 10),
) {
  const dates = (events ?? [])
    .map((event) => event.endDate ?? event.date)
    .filter(Boolean)
    .sort();
  const last = dates.at(-1) ?? null;
  if (!last) return { last: null, daysLeft: null };
  return {
    last,
    daysLeft: Math.round((Date.parse(last) - Date.parse(today)) / 86_400_000),
  };
}

/* ------------------------------------------------------------------- main */

async function main() {
  const data = JSON.parse(await readFile(DATA_FILE, "utf8"));
  const sources = JSON.parse(await readFile(SOURCES_FILE, "utf8"));

  let scraped = [];
  const checkedAt = new Date().toISOString();
  const health = [];

  // Silverbird: keep watching for now, but only if it actually returns
  // film rows after the filmrow sanity filter. An empty page is not an
  // error; it is just a live check that nothing matched.
  try {
    const sb = parseFromSilverbird(await fetchText("https://silverbirdcinemas.com/cinema/galleria/"));
    const sbFilms = sb.filter(isFilmRow);
    console.log(`Silverbird: ${sb.length} block(s), ${sbFilms.length} film(s) after sanity filter`);
    if (sbFilms.length) scraped = scraped.concat(sbFilms);
    else console.log("  (no film blocks survived the sanity filter — keeping the source as a live check)");
    health.push({ name: "Silverbird Cinemas", ok: true, films: sbFilms.length, error: null });
  } catch (error) {
    console.error(`! Silverbird failed: ${error.message}`);
    health.push({ name: "Silverbird Cinemas", ok: false, films: 0, error: error.message });
  }

  // Watchlisted tracker URLs (add to data/movie-sources.json).
  for (const entry of sources.sources ?? []) {
    try {
      const replay = FROM_FILE && entry.name.includes("NaijaSabi");
      const html = replay ? await readFile(FROM_FILE, "utf8") : await fetchText(entry.url);
      let ev;
      if (entry.name.includes("NaijaSabi")) {
        ev = parseNaijaSabi(html);
      } else if (entry.name.includes("African Movie Database")) {
        ev = parseAMDB(html);
      } else {
        ev = parseGenericTracker(html, entry);
      }
      // The source list is the truth about where a row came from, so a parser's
      // own hardcoded URL cannot stamp this month's page with last month's.
      ev = ev.map((row) => ({ ...row, sourceUrl: entry.url ?? row.sourceUrl }));
      const evFilms = ev.filter(isFilmRow);
      console.log(
        `${entry.name}${replay ? " (from saved copy)" : ""}: ${ev.length} block(s), ${evFilms.length} film(s) after sanity filter`,
      );
      if (replay) {
        for (const row of evFilms) console.log(`    ${row.date}  ${row.title}  [${row.platform}]`);
      }
      if (evFilms.length) scraped = scraped.concat(evFilms);
      health.push({ name: entry.name, ok: true, films: evFilms.length, error: null });
      await sleep(120);
    } catch (error) {
      console.error(`! ${entry.name} failed: ${error.message}`);
      health.push({ name: entry.name, ok: false, films: 0, error: error.message });
    }
  }

  // Drop anything that does not look like a real film row before merging,
  // so later fallback sources (generic trackers, empty Silverbird runs) do not
  // pollute data/movies.json with page-headline or venue-name junk.
  //
  // Nollywood Reporter in particular returns the page's own headline/title
  // as a single block; that is filtered out here, and the script exits with
  // "no movies" rather than writing a junk row.
  scraped = scraped.filter(isFilmRow);

  // Record which sources answered, even when nothing is written: the /movies
  // page uses this to say which feed is down rather than pretending all is well.
  if (!DRY_RUN) {
    await writeFile(
      STATUS_FILE,
      `${JSON.stringify({ checkedAt, sources: health }, null, 2)}\n`,
      "utf8",
    );
  }

  if (scraped.length === 0) {
    console.error(
      "No movies scraped — leaving data untouched. If the current slate has " +
        "finished, add the next month's release page to data/movie-sources.json.",
    );
    process.exitCode = 1;
    return;
  }

  const { events, added } = mergeEvents(data.events ?? [], scraped);

  // Keep films that are still in their window or upcoming.
  const cutoff = today();
  const kept = events
    .filter((m) => (m.endDate ?? m.date) >= cutoff)
    .sort((a, b) => a.date.localeCompare(b.date));

  // A scrape can succeed and still be last month's news: the December pages
  // parse just as well in January. Without this guard the run would write an
  // empty slate and /movies would go blank without anyone being told. The
  // earlier warning about a slate that is about to run out belongs to
  // check:health, which owns that threshold.
  if (kept.length === 0) {
    console.error(
      `No upcoming films: everything scraped ends before ${cutoff}. The pages ` +
        "in data/movie-sources.json describe a slate that has finished — add " +
        "the next month's release page and drop the old one.",
    );
    process.exitCode = 1;
    return;
  }

  const changed = JSON.stringify(kept) !== JSON.stringify(data.events ?? []);

  console.log(
    `  ${scraped.length} scraped, added ${added.length}, kept ${kept.length}${changed ? " — changed" : ""}`,
  );
  for (const m of added) console.log(`    + ${m.date}  ${m.title}  [${m.platform ?? "cinema"}]`);

  if (!changed) {
    console.log("No changes — nothing written.");
    return;
  }

  assertWritable(kept);

  const next = { ...data, updatedAt: new Date().toISOString(), events: kept };

  if (DRY_RUN) {
    console.log("Dry run — not writing data/movies.json");
    return;
  }

  await writeFile(DATA_FILE, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  console.log(`Wrote ${kept.length} movies to data/movies.json`);
}

export {
  isFilmRow,
  parseAMDB,
  parseDate,
  parseFromSilverbird,
  parseGenericTracker,
  parseNaijaSabi,
};

// Only scrape when run directly; the fixture tests import the parsers.
// Basenames, not full URLs: the project directory is often reached through a
// symlink, which makes import.meta.url differ from argv[1]'s resolved path.
const runDirectly =
  Boolean(process.argv[1]) &&
  path.basename(process.argv[1]) === path.basename(fileURLToPath(import.meta.url));

if (runDirectly) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
