import { activities, markets } from "../data/activities";
import { clubs } from "../data/clubs";
import { schools } from "../data/schools";
import { allDishes } from "./dishes";
import { CATEGORY_LABELS, allPlaces } from "./place";
import { showEvents } from "./shows";
import { movieEvents } from "./movies";

/**
 * One index over the whole guide: places, things to do, shows, films and
 * dishes.
 *
 * A few hundred rows, so scoring in memory per request is cheaper than any
 * search service — and it keeps the page working without a backend.
 */

export type HitKind = "place" | "activity" | "show" | "movie" | "eat";

export type SearchHit = {
  kind: HitKind;
  id: string;
  href: string;
  title: string;
  subtitle: string;
  meta: string | null;
  score: number;
};

type Entry = Omit<SearchHit, "score"> & {
  /** Normalised name, weighted above the supporting text. */
  titleKey: string;
  bodyKey: string;
};

/** "Èkó" and "Eko" are the same query; so are curly and straight quotes. */
const normalise = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const entry = (
  hit: Omit<SearchHit, "score">,
  title: string,
  body: (string | null | undefined)[],
): Entry => ({
  ...hit,
  titleKey: normalise(title),
  bodyKey: normalise(body.filter(Boolean).join(" ")),
});

const INDEX: Entry[] = [
  ...allPlaces.map((place) =>
    entry(
      {
        kind: "place",
        id: place.id,
        href: `/places/${place.id}`,
        title: place.name,
        subtitle: `${CATEGORY_LABELS[place.category] ?? place.category} · ${place.area}`,
        meta: place.price,
      },
      place.name,
      [place.area, place.category, place.tagline, place.note, place.address],
    ),
  ),
  // The activities page: one row per activity, one per venue inside it (so a
  // search for "Funturf" or "Glix" lands too), and one per market. They all
  // resolve to an anchor on /activities rather than a page of their own.
  ...activities.flatMap((activity) => [
    entry(
      {
        kind: "activity",
        id: activity.id,
        href: `/activities#${activity.id}`,
        title: activity.title,
        subtitle: activity.venues.length
          ? `${activity.venues.length} venue${activity.venues.length === 1 ? "" : "s"} in Lagos`
          : "No venue confirmed yet",
        meta: activity.price ?? null,
      },
      activity.title,
      [
        activity.blurb,
        activity.bestFor,
        activity.note,
        ...activity.venues.map(
          (venue) => `${venue.name} ${venue.area} ${venue.address ?? ""} ${venue.note}`,
        ),
      ],
    ),
    ...activity.venues.map((venue, index) =>
      entry(
        {
          kind: "activity",
          id: `${activity.id}-${index}`,
          href: `/activities#${activity.id}`,
          title: venue.name,
          subtitle: `${activity.title} · ${venue.area}`,
          meta: null,
        },
        venue.name,
        [venue.note, venue.address, venue.area, activity.title, activity.blurb],
      ),
    ),
  ]),
  ...schools.map((school) =>
    entry(
      {
        kind: "activity",
        id: school.id,
        href: `/activities#${school.id}`,
        title: school.name,
        subtitle: `Campus · ${school.area}`,
        meta: school.founded,
      },
      `${school.name} ${school.short}`,
      [school.note, school.area, school.address],
    ),
  ),
  ...markets.map((market) =>
    entry(
      {
        kind: "activity",
        id: market.id,
        href: `/markets/${market.id}`,
        title: market.name,
        subtitle: `Market · ${market.area}`,
        meta: null,
      },
      market.name,
      [market.knownFor, market.note, market.area, market.bestTime],
    ),
  ),
  ...clubs.map((club) =>
    entry(
      {
        kind: "activity",
        id: `club-${club.id}`,
        href: `/clubs/${club.id}`,
        title: club.name,
        subtitle: `${club.league} · ${club.nickname}`,
        meta: club.founded,
      },
      `${club.name} ${club.short}`,
      [club.nickname, club.summary, club.ground, ...club.story, ...club.honours],
    ),
  ),
  ...showEvents.map((event) =>
    entry(
      {
        kind: "show",
        id: event.id,
        href: `/shows/${event.id}`,
        title: event.title,
        subtitle: [event.venue, event.area].filter(Boolean).join(" · "),
        meta: event.date,
      },
      event.title,
      [(event.artists ?? []).join(" "), event.venue, event.area, event.note],
    ),
  ),
  ...movieEvents.map((movie) =>
    entry(
      {
        kind: "movie",
        id: movie.id,
        href: "/movies",
        title: movie.title,
        subtitle: movie.cinemas[0]?.name
          ? `${movie.cinemas[0].name} · ${movie.date}`
          : movie.date,
        meta: movie.date,
      },
      movie.title,
      [movie.source, movie.note],
    ),
  ),
  ...allDishes.map((dish) =>
    entry(
      {
        kind: "eat",
        id: dish.id,
        href: `/eat/${dish.id}`,
        title: dish.name,
        subtitle: "What to eat",
        meta: null,
      },
      dish.name,
      [dish.note, dish.about],
    ),
  ),
];

export const SHOWING_LIMIT = 30;
const LIMIT = 30;

/** Fractions of the passed-in limit to reserve per kind before spending the
 * rest on score. They scale with the limit, so a smaller limit shrinks every
 * floor rather than leaving a caller with only places and activities.
 *
 * They are fractions, not hard counts, so a kind with fewer hits than its
 * floor simply leaves the remainder in the pool.
 */
const FLOORS: Record<HitKind, number> = {
  place: 0.26,
  activity: 0.26,
  show: 0.13,
  movie: 0.10,
  eat: 0.10,
};

const KINDS = Object.keys(FLOORS) as HitKind[];
const GROUP_MIN = 2;
const FLOOR_SPLIT: Record<HitKind, number> = {
  place: 14,
  activity: 14,
  show: 6,
  movie: 4,
  eat: 4,
};

/**
 * Every token has to match somewhere (AND), so "lekki beach" narrows rather
 * than widens. A title hit outscores a note hit.
 */
export function searchAll(query: string, limit?: number, offset?: number): SearchHit[] {
  const cappedLimit = Math.max(1, limit ?? LIMIT);
  const cappedOffset = Math.max(0, offset ?? 0);
  const tokens = normalise(query).split(" ").filter(Boolean).slice(0, 6);
  if (tokens.length === 0) return [];

  const hits: SearchHit[] = [];

  for (const { titleKey, bodyKey, ...hit } of INDEX) {
    let score = 0;

    for (const token of tokens) {
      if (titleKey.includes(token)) score += 2;
      else if (bodyKey.includes(token)) score += 1;
      else {
        score = 0;
        break;
      }
    }

    if (score > 0) hits.push({ ...hit, score });
  }

  const ranked = hits.sort(
    (a, b) => b.score - a.score || a.title.localeCompare(b.title),
  );
  if (ranked.length <= cappedLimit) return ranked;

  // Reserve a floor per kind, then spend what is left on the best of the rest.
  // A kind with fewer hits than its floor simply leaves the remainder in the
  // pool, so a narrow query is not padded with weak matches.
  const chosen = new Set<SearchHit>();
  for (const kind of KINDS) {
    const floor =
      cappedLimit <= FLOOR_SPLIT[kind]
        ? Math.max(GROUP_MIN, Math.floor(cappedLimit * FLOORS[kind]))
        : Math.floor(cappedLimit * FLOORS[kind]);
    let taken = 0;
    for (const hit of ranked) {
      if (taken >= floor || chosen.size >= cappedLimit) break;
      if (hit.kind !== kind) continue;
      chosen.add(hit);
      taken += 1;
    }
  }
  for (const hit of ranked) {
    if (chosen.size >= cappedLimit) break;
    chosen.add(hit);
  }

  const selected = [...chosen].sort(
    (a, b) => b.score - a.score || a.title.localeCompare(b.title),
  );
  return selected.slice(cappedOffset, cappedOffset + cappedLimit);
}

/** When paging, the backend caps the per-page window but callers that want the
 * raw ranked set (e.g. for a "more results" count) can ask for it without an
 * offset/slice. Kept narrow by default for the same reasons as `searchAll`.
 */
export function searchAllCount(
  query: string,
): number {
  const tokens = normalise(query).split(" ").filter(Boolean).slice(0, 6);
  if (tokens.length === 0) return 0;

  let count = 0;
  for (const { titleKey, bodyKey } of INDEX) {
    let matched = 1;
    for (const token of tokens) {
      if (titleKey.includes(token) || bodyKey.includes(token)) {
        matched *= 1;
      } else {
        matched = 0;
        break;
      }
    }
    count += matched;
  }
  return count;
}

export const KIND_LABELS: Record<HitKind, string> = {
  place: "Places",
  activity: "Things to do",
  show: "Shows",
  movie: "Films",
  eat: "Food",
};
