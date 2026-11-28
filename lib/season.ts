import { monthLabel, monthRangeLabel, todayInLagos } from "./schedule";
import { showEvents } from "./shows";

/**
 * The span the shows calendar covers, read from the dates in data/shows.json
 * rather than typed in.
 *
 * Nothing here knows about December. A scrape in March moves the window to
 * March, a run in December moves it back, and the year follows the last date on
 * file — so the guide survives the other eleven months and the next year
 * without an edit. Everything is a pure function of the data plus today in
 * Lagos.
 */

export type Season = {
  /** First and last night currently on the calendar. */
  start: string;
  end: string;
  year: number;
  /** "December 2026", or "November – December 2026" across a month boundary. */
  label: string;
};

export function seasonWindow(
  events = showEvents,
  today = todayInLagos(),
): Season {
  // Upcoming dates describe the live calendar; with none left, the window
  // describes the archive rather than dressing a past night up as current.
  const upcoming = events.filter(
    (event) => (event.endDate ?? event.date) >= today,
  );
  const pool = upcoming.length > 0 ? upcoming : events;

  const first = pool
    .map((event) => event.date)
    .filter(Boolean)
    .sort()[0];
  const last = pool
    .map((event) => event.endDate ?? event.date)
    .filter(Boolean)
    .sort()
    .pop();

  const start = first ?? today;
  const end = last ?? today;

  return {
    start,
    end,
    year: Number(end.slice(0, 4)),
    label: monthRangeLabel(start, end),
  };
}

/**
 * The window's name as of today. A function on purpose: a module-level constant
 * is evaluated once per process, so a server that stays up through the turn of
 * a month would keep titling the site with the month it started in.
 */
export const seasonLabel = (today = todayInLagos()) =>
  seasonWindow(showEvents, today).label;

/** A show is over once its last night has passed. */
export const showIsPast = (
  event: { date: string; endDate?: string | null },
  today: string,
) => (event.endDate ?? event.date) < today;

/** Everything still to come, which is what every listing should show first. */
export const upcomingShows = (today = todayInLagos()) =>
  showEvents.filter((event) => !showIsPast(event, today));

/**
 * What the hero's plan bar promises. With nothing on the calendar the window
 * describes the archive, so name the month we are actually in instead.
 */
export const plannedSeasonLabel = (today = todayInLagos()) => {
  const window = seasonWindow(showEvents, today);
  return today > window.end ? monthLabel(today) : window.label;
};
