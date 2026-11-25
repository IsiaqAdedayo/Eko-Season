import { todayInLagos } from "./schedule";
import { showEvents } from "./shows";

/**
 * The festival window, read from the calendar rather than typed in.
 *
 * The guide has to survive the other eleven months and the next December, so
 * the dates come from the shows data: when a new season is scraped the window
 * moves with it and nothing here needs editing. Everything is a pure function
 * of the data plus today's date in Lagos.
 */

export type Season = { start: string; end: string; year: number };

const yearOf = (iso: string) => Number(iso.slice(0, 4));

export function seasonWindow(
  events = showEvents,
  today = todayInLagos(),
): Season {
  const lastNight = events
    .map((event) => event.endDate ?? event.date)
    .filter(Boolean)
    .sort();

  const end = lastNight[lastNight.length - 1];
  const year = end ? yearOf(end) : yearOf(today);

  return {
    start: `${year}-12-01`,
    end: end ?? `${year}-12-31`,
    year,
  };
}

export const season = seasonWindow();
export const seasonLabel = `December ${season.year}`;

export type SeasonState = "before" | "during" | "after";

export const seasonState = (
  today: string,
  window: Season = seasonWindow(showEvents, today),
): SeasonState =>
  today < window.start ? "before" : today > window.end ? "after" : "during";

/** A show is over once its last night has passed. */
export const showIsPast = (
  event: { date: string; endDate?: string | null },
  today: string,
) => (event.endDate ?? event.date) < today;

/** Everything still to come, which is what every listing should show first. */
export const upcomingShows = (today = todayInLagos()) =>
  showEvents.filter((event) => !showIsPast(event, today));

/**
 * What the hero's plan bar promises. Between seasons next year's dates are not
 * published yet, so it says "December" rather than repeating last year's.
 */
export const plannedSeasonLabel = (today = todayInLagos()) =>
  seasonState(today) === "after" ? "December" : seasonLabel;
