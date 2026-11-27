/**
 * NPFL fixtures and results, read from the league's own SportsPress table.
 *
 * The league site has no API, so this parses the table it renders: one <tr> per
 * match with a <date>, a "Home vs Away" event link, a time-or-score cell and a
 * ground. It is scraped, not guaranteed — a page that is rebound, an RSS-style
 * redirect, an empty table or anything that raises is treated as "unavailable"
 * and returns `null`. Callers degrade: the club page prints the league link and
 * the "no fixtures" note instead of a broken load or a 500.
 *
 * Build-time safety: during `next build` there is no browser runtime, so the
 * first render hits the live site once and then reuses the cached result for
 * every static pass. A hard failure turns into `null`, which generates real HTML
 * (the unavailable state) rather than stopping the build. The 10-second timeout
 * keeps it from hanging any longer than that.
 *
 * Everything is cached for half an hour by Next's fetch cache; a club page is
 * not worth a request per view.
 */

const SOURCE = "https://npfl.com.ng/fixtures-results/";
const REVALIDATE = 1800;

export type Fixture = {
  /** "2026-11-21 16:00:04" — the league site's own format. */
  date: string;
  home: string;
  away: string;
  /** Null until the match is played. */
  score: { home: number; away: number } | null;
  /** "16:00", only when there is no score yet. */
  kickoff: string | null;
  venue: string;
  url: string | null;
};

export type FixtureFeed = {
  fixtures: Fixture[];
  source: string;
  fetchedAt: string;
};

export type ClubForm = {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
};

export type ClubFixtures = {
  results: Fixture[];
  upcoming: Fixture[];
  form: ClubForm;
};

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&apos;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

const cell = (row: string, cls: string) => {
  const match = row.match(new RegExp(`<td class="${cls}[^"]*"[^>]*>([\\s\\S]*?)</td>`));
  return match ? match[1] : "";
};

/** One parsed row, or null when the row is not a match. */
function parseRow(row: string): Fixture | null {
  if (!row.includes("data-event")) return null;

  const date = (row.match(/<date>([^<]+)<\/date>/) || [])[1];
  const event = cell(row, "data-event");
  const label = text((event.match(/<a[^>]*>([\s\S]*?)<\/a>/) || [])[1] ?? "");
  const [home, away] = label.split(/\s+vs\s+/i);
  if (!date || !home || !away) return null;

  const value = text(cell(row, "data-time"));
  const score = value.match(/(\d+)\s*[-–]\s*(\d+)/);
  const kickoff = value.match(/\b(\d{1,2}:\d{2})\b/);

  return {
    date,
    home: home.trim(),
    away: away.trim(),
    score: score ? { home: Number(score[1]), away: Number(score[2]) } : null,
    kickoff: score || !kickoff ? null : kickoff[1],
    venue: text(cell(row, "data-venue")),
    url: (row.match(/href="(https:\/\/npfl\.com\.ng\/event\/[^"]+)"/) || [])[1] ?? null,
  };
}

export async function npflFixtures(): Promise<FixtureFeed | null> {
  try {
    const response = await fetch(SOURCE, {
      headers: { "user-agent": "EkoSeasonGuide/1.0 (+https://ekoseason.example)" },
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return null;

    const html = await response.text();
    const fixtures = html
      .split("<tr")
      .slice(1)
      .map(parseRow)
      .filter((fixture): fixture is Fixture => fixture !== null);

    // Reachable HTML with nothing usable in the table: the site changed shape,
    // the table was emptied, or the real content is behind something we do not
    // parse. "Nothing we can use" still degrades the same way as a failure.
    if (fixtures.length === 0) return null;
    return {
      fixtures,
      source: SOURCE,
      fetchedAt: new Date().toISOString().slice(0, 10),
    };
  } catch {
    return null;
  }
}

const sameClub = (name: string, aliases: string[]) =>
  aliases.some((alias) => name.toLowerCase().includes(alias.toLowerCase()));

/**
 * A club's season, split into what has happened and what is next. Results come
 * back newest first and upcoming oldest first, because that is the order you
 * read them in.
 */
export function clubFixtures(feed: FixtureFeed, aliases: string[], today = new Date()): ClubFixtures {
  const mine = feed.fixtures.filter(
    (fixture) => sameClub(fixture.home, aliases) || sameClub(fixture.away, aliases),
  );

  const results = mine
    .filter((fixture) => fixture.score !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const upcoming = mine
    .filter((fixture) => fixture.score === null)
    .filter((fixture) => fixture.date.slice(0, 10) >= today.toISOString().slice(0, 10))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const form: ClubForm = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 };
  for (const fixture of results) {
    if (!fixture.score) continue;
    const home = sameClub(fixture.home, aliases);
    const forGoals = home ? fixture.score.home : fixture.score.away;
    const against = home ? fixture.score.away : fixture.score.home;
    form.played += 1;
    form.goalsFor += forGoals;
    form.goalsAgainst += against;
    if (forGoals > against) form.won += 1;
    else if (forGoals === against) form.drawn += 1;
    else form.lost += 1;
  }

  return { results, upcoming, form };
}

/** The fixture's outcome from one club's side, for the W/D/L column. */
export function outcome(fixture: Fixture, aliases: string[]) {
  if (!fixture.score) return null;
  const home = sameClub(fixture.home, aliases);
  const forGoals = home ? fixture.score.home : fixture.score.away;
  const against = home ? fixture.score.away : fixture.score.home;
  if (forGoals > against) return "W" as const;
  if (forGoals === against) return "D" as const;
  return "L" as const;
}

/** "Saturday 21 November" from the league's "2026-11-21 16:00:04". */
export function fixtureDay(date: string) {
  const parsed = new Date(`${date.replace(" ", "T")}+01:00`);
  if (Number.isNaN(parsed.getTime())) return date.slice(0, 10);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Africa/Lagos",
  }).format(parsed);
}

export function fixtureTime(fixture: Fixture) {
  if (fixture.score) return null;
  if (fixture.kickoff) return fixture.kickoff;
  const parsed = new Date(`${fixture.date.replace(" ", "T")}+01:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Lagos",
  }).format(parsed);
}
