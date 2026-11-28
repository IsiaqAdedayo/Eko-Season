import { moviesUpdatedAt } from "./movies";
import { showsUpdatedAt } from "./shows";

/**
 * How old is a data set, in words? The guide sells itself on being current, so
 * every listing page has to be able to say when it was last refreshed — and
 * admit honestly when it has been a while.
 *
 * The page-level stale flag is deliberately longer than the scraper cadence:
 * shows and movies are re-read weekly, but the public line should keep saying
 * "current for this week" through most of that week, not flip to a loud stale
 * banner on day eight. The real calendar-end signal lives in check:health and
 * in the DataStamp copy for movies, not in this shared threshold.
 */
export type Freshness = {
  iso: string;
  days: number;
  label: string;
  stale: boolean;
};

const DAY_MS = 86_400_000;

/** When a feed has gone stale enough to stop pretending it is current. */
export const STALE_AFTER_DAYS = 14;

export function freshness(
  iso: string,
  staleAfterDays = STALE_AFTER_DAYS,
  now = new Date(),
): Freshness {
  const then = new Date(iso).getTime();
  const ms = Number.isNaN(then) ? 0 : Math.max(0, now.getTime() - then);
  const days = Math.floor(ms / DAY_MS);

  const label =
    days === 0
      ? "today"
      : days === 1
        ? "yesterday"
        : days < 14
          ? `${days} days ago`
          : days < 60
            ? `${Math.round(days / 7)} weeks ago`
            : `${Math.round(days / 30)} months ago`;

  return { iso, days, label, stale: days > staleAfterDays };
}

export const showsFreshness = (now = new Date()) =>
  freshness(showsUpdatedAt, STALE_AFTER_DAYS, now);

export const moviesFreshness = (now = new Date()) =>
  freshness(moviesUpdatedAt, STALE_AFTER_DAYS, now);

/** "19 November 2026 · 5 days ago" — one line, no duplicated date maths. */
export function freshnessLine(iso: string, now = new Date()) {
  const when = freshness(iso, STALE_AFTER_DAYS, now);
  const date = new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "long", year: "numeric" },
  );
  return `${date} · ${when.label}`;
}
