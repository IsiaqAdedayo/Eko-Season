import { scheduledPlaces, type Place } from "./place";
import type { CorridorId } from "./areas";
import { showEvents, type ShowEvent } from "./shows";

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
  ],
};

export function corridorForArea(area: string | null | undefined): CorridorId | null {
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
) => !corridor || corridorForArea(event.area) === null || corridorForArea(event.area) === corridor;

export const planDay = (date: string): DayPlan => {
  const weekday = weekdayKey(date);
  return {
    date,
    shows: showEvents.filter((event) => coversDay(event, date)),
    // Only nights with a published schedule: an unsourced guess is not a plan.
    clubs: scheduledPlaces.filter((place) => place.nights.includes(weekday)),
  };
};

/** Today plus the next six days, in Lagos time. */
/** First show strictly after the given date, for the "nothing on yet" case. */
export const nextShowAfter = (date: string) =>
  showEvents.find((event) => event.date > date) ?? null;
