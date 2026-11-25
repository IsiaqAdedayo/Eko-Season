/** Nollywood cinema and movie releases for Lagos.

   Movies are not fetched live on every request — the page is built from
   data/movies.json, which a refresh job keeps current from cinema and
   release-tracker sources. That keeps the site fast and keeps credentials
   out of the page.
 */

import moviesData from "../data/movies.json";
import sourceStatus from "../data/movie-source-status.json";

export type MovieEvent = {
  id: string;
  title: string;
  /** Release date as published by the distributor. */
  date: string;
  endDate: string | null;
  /** Cinemas in Lagos where the movie is (or will be) screening. */
  cinemas: CinemaRef[];
  /** The distributor or release source. */
  source: string;
  /** Where we read the release date from. */
  sourceUrl: string;
  note: string | null;
  /** Which cinemas in our place list actually screen this. */
  venueIds: string[];
};

export type CinemaRef = {
  name: string;
  area: string | null;
  url: string | null;
};

export const movieEvents = moviesData.events as MovieEvent[];

export const moviesUpdatedAt = moviesData.updatedAt;

/** What the last scrape found, per source. Written by scripts/scrape-movies.mjs. */
export type MovieSourceHealth = {
  name: string;
  ok: boolean;
  films: number;
  error: string | null;
};

const status = sourceStatus as { sources?: MovieSourceHealth[] };

export const movieSourceHealth = status.sources ?? [];

/** Cinema place ids we recognise from the Lagos place list. */
const RECOGNISED_CINEMA_IDS = [
  "ebonylife-cinemas",
  "silverbird-galleria",
  "ozone-cinemas",
  "purple-maryland",
  "dream-park",
];

/** Best-fit cinemas for a movie from its screening list. */
/** Which of our known Lagos cinemas a movie is screening at. */
export function screeningAtLagosCinemas(movie: MovieEvent) {
  const lower = (s: string) => s.toLowerCase();
  const known = RECOGNISED_CINEMA_IDS.map((id) => ({
    id,
    label: id === "ebonylife-cinemas"
      ? "EbonyLife Cinemas"
      : id === "silverbird-galleria"
        ? "Silverbird Galleria"
        : id === "ozone-cinemas"
          ? "Ozone Cinemas"
          : id === "purple-maryland"
            ? "Purple Maryland"
            : "Dream Park",
  }));

  const hits: string[] = [];
  for (const c of movie.cinemas) {
    for (const k of known) {
      if (lower(c.name).includes(lower(k.label))) {
        hits.push(k.id);
      }
    }
  }
  // Also match by the place id when the cinema ref uses our id directly.
  return [...new Set([...hits, ...movie.venueIds.filter((id) => RECOGNISED_CINEMA_IDS.includes(id))])];
}
