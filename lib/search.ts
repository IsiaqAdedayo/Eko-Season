import { allDishes } from "./dishes";
import { CATEGORY_LABELS, allPlaces } from "./place";
import { showEvents } from "./shows";
import { movieEvents } from "./movies";

/**
 * One index over the whole guide: places, shows, films and dishes.
 *
 * A few hundred rows, so scoring in memory per request is cheaper than any
 * search service — and it keeps the page working without a backend.
 */

export type HitKind = "place" | "show" | "movie" | "eat";

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

const LIMIT = 24;

/**
 * Every token has to match somewhere (AND), so "lekki beach" narrows rather
 * than widens. A title hit outscores a note hit.
 */
export function searchAll(query: string, limit = LIMIT): SearchHit[] {
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

  return hits
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);
}

export const KIND_LABELS: Record<HitKind, string> = {
  place: "Places",
  show: "Shows",
  movie: "Films",
  eat: "Food",
};
