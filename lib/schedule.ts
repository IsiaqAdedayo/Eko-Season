import { scheduledPlaces, type Place } from "./place";
import type { CorridorId } from "./areas";
import { isParty, showEvents, type ShowEvent } from "./shows";

const LAGOS = "Africa/Lagos";

/** Noon UTC avoids DST/edge-of-day surprises when we only need a calendar date. */
const at = (iso: string) => new Date(`${iso}T12:00:00Z`);

/** Today in Lagos, whatever timezone the server sits in. */
export const todayInLagos = (now = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: LAGOS,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

export function addDays(iso: string, days: number) {
  const date = at(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** "2026-12-17" -> "thu" */
export const weekdayKey = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" })
    .format(at(iso))
    .toLowerCase();

export const weekdayLong = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" }).format(
    at(iso),
  );

/** "17 Nov" */
export const shortDay = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(at(iso));

/** "Tuesday 17 November 2026" */
export const longDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(at(iso));

/** "2026-12-17" -> "December 2026" */
export const monthLabel = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(at(`${iso.slice(0, 7)}-01`));

/** Month name on its own, for a range that shares one year. */
const monthName = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" }).format(
    at(`${iso.slice(0, 7)}-01`),
  );

/**
 * "December 2026", or "November – December 2026" when a listing runs across
 * months. Nothing is hardcoded: the label follows the dates in the data.
 */
export function monthRangeLabel(fromIso: string, toIso: string) {
  const fromMonth = fromIso.slice(0, 7);
  const toMonth = toIso.slice(0, 7);
  if (fromMonth === toMonth) return monthLabel(toMonth);

  const fromYear = Number(fromMonth.slice(0, 4));
  const toYear = Number(toMonth.slice(0, 4));
  if (fromYear === toYear) {
    return `${monthName(fromMonth)} – ${monthName(toMonth)} ${toYear}`;
  }
  return `${monthName(fromMonth)} ${fromYear} – ${monthName(toMonth)} ${toYear}`;
}

/** First day of the calendar month an ISO date falls in. */
export const monthStart = (iso: string) => `${iso.slice(0, 7)}-01`;

/** Last day of that month. */
export function monthEnd(iso: string) {
  const [year, month] = iso.slice(0, 7).split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}

const coversDay = (event: ShowEvent, date: string) =>
  event.date <= date && (event.endDate ?? event.date) >= date;

export type DayPlan = {
  date: string;
  shows: ShowEvent[];
  clubs: Place[];
};

/**
 * Which side of town a venue is on.
 *
 * Geographic, not the same lists the /places corridors use: Victoria Island
 * and Ikoyi are on the Island, so a show there belongs there too. A venue we
 * have no area for (the festival stages publish only "Lagos") returns null and
 * is treated as citywide rather than hidden.
 */
const CORRIDOR_AREAS: Record<CorridorId, string[]> = {
  lekki: [
    "Lekki",
    "Lekki Phase 1",
    "Oniru",
    "Eleko",
    "Chevron Drive",
    "Ajah",
    "Ibeju-Lekki",
    "Sangotedo",
    "Epe",
  ],
  "lagos-island": [
    "Lagos Island",
    "Lagos Harbour",
    "Victoria Island",
    "Ikoyi",
    "Onikan",
    "Marina",
  ],
  mainland: [
    "Ikeja",
    "Yaba",
    "Maryland",
    "Bariga",
    "Ebute Metta",
    "Iganmu",
    "Surulere",
    "Ojota",
    "Apapa",
    "Agege",
    "Ikorodu",
    "Gbagada",
    "Ogudu",
    "Magodo",
    "Ketu",
    "Oshodi",
    "Mushin",
    "Festac",
    "Amuwo-Odofin",
    "Ilupeju",
    "Anthony",
    "Ojodu",
    "Badagry",
  ],
};

export function corridorForArea(
  area: string | null | undefined,
): CorridorId | null {
  if (!area) return null;
  const match = (Object.entries(CORRIDOR_AREAS) as [CorridorId, string[]][]).find(
    ([, areas]) => areas.includes(area),
  );
  return match ? match[0] : null;
}

/** A show with no published venue area is citywide, never filtered out. */
export const showMatchesCorridor = (
  event: ShowEvent,
  corridor: CorridorId | null,
) =>
  !corridor ||
  corridorForArea(event.area) === null ||
  corridorForArea(event.area) === corridor;

/** Night rows include only venues with a published weekly-night schedule.
 *  A venue that has regular opening hours from a Google Maps aggregate, but no
 *  published recurring night programme, does not present as a "night" here. */
export const isPublishedNightVenue = (place: Place) =>
  place.nightsSource !== null &&
  place.nightsSource.url !== null &&
  place.nightsSource.url.startsWith("https://www.google.com/maps/") === false;

export const planDay = (date: string): DayPlan => {
  const weekday = weekdayKey(date);
  return {
    date,
    shows: showEvents.filter((event) => coversDay(event, date)),
    clubs: scheduledPlaces.filter(
      (place) => isPublishedNightVenue(place) && place.nights.includes(weekday),
    ),
  };
};

/**
 * Parties and raves running inside a window, soonest first.
 *
 * Most listings publish no price at all, so ranking the list by price would
 * float an arbitrary handful to the top and imply the rest cost more. Date is
 * the one fact every row carries; price only breaks ties within a night.
 */
export function partiesBetween(
  from: string,
  days: number,
  corridor: CorridorId | null = null,
) {
  const to = addDays(from, days - 1);
  return showEvents
    .filter(isParty)
    .filter((event) => event.date <= to && (event.endDate ?? event.date) >= from)
    .filter((event) => showMatchesCorridor(event, corridor))
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        (a.priceFrom ?? Number.POSITIVE_INFINITY) -
          (b.priceFrom ?? Number.POSITIVE_INFINITY) ||
        a.title.localeCompare(b.title),
    );
}

/** First show strictly after the given date, for the "nothing on yet" case. */
export const nextShowAfter = (date: string) =>
  showEvents.find((event) => event.date > date) ?? null;
