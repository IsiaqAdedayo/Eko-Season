/**
 * Nigerian public holidays, for whatever year is asked for.
 *
 * Fixed-date holidays are set by law. Easter moves, so Good Friday and Easter
 * Monday are computed from the Gregorian Easter algorithm — the dates the
 * federal calendar uses. Eid al-Fitr, Eid al-Adha and Mawlid follow the lunar
 * calendar and are confirmed after moon sighting, so they are never guessed
 * here: they go into ANNOUNCED_HOLIDAYS once the federal government publishes
 * them.
 *
 * What individual venues do on a holiday is not something this project can
 * verify, so the page states general guidance separately instead of pretending
 * to know opening hours.
 */
export type Holiday = {
  date: string; // ISO, the gazetted day
  name: string;
};

const pad = (value: number) => String(value).padStart(2, "0");

/** [month, day, name] — fixed by law, every year. */
const FIXED: Array<[number, number, string]> = [
  [1, 1, "New Year's Day"],
  [5, 1, "Workers' Day"],
  [6, 12, "Democracy Day"],
  [10, 1, "Independence Day"],
  [12, 25, "Christmas Day"],
  [12, 26, "Boxing Day"],
];

/** Anonymous Gregorian algorithm: the Sunday Easter falls on. */
function easterSunday(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

const iso = (date: Date) => date.toISOString().slice(0, 10);

const shift = (date: Date, days: number) =>
  new Date(date.getTime() + days * 86_400_000);

/**
 * Movable holidays that are announced rather than calculated. Add gazetted
 * dates here; nothing else in the site needs changing.
 */
export const ANNOUNCED_HOLIDAYS: Holiday[] = [];

/** Every holiday for a year, in date order. */
export function holidaysFor(year: number): Holiday[] {
  const easter = easterSunday(year);

  return [
    ...FIXED.map(([month, day, name]) => ({
      date: `${year}-${pad(month)}-${pad(day)}`,
      name,
    })),
    { date: iso(shift(easter, -2)), name: "Good Friday" },
    { date: iso(shift(easter, 1)), name: "Easter Monday" },
    ...ANNOUNCED_HOLIDAYS.filter(
      (holiday) => holiday.date.slice(0, 4) === String(year),
    ),
  ].sort((a, b) => a.date.localeCompare(b.date));
}

/** The next holidays from a date onward, across however many years given. */
export const upcomingHolidays = (today: string, years = 2, limit = 6) =>
  Array.from({ length: years }, (_, offset) => Number(today.slice(0, 4)) + offset)
    .flatMap((year) => holidaysFor(year))
    .filter((holiday) => holiday.date >= today)
    .slice(0, limit);

export const nextHoliday = (today: string, years = 2) =>
  upcomingHolidays(today, years, 1)[0] ?? null;

/**
 * General guidance, deliberately not venue-specific: public holidays usually
 * mean reduced hours somewhere, and only the venue can confirm its own.
 */
export const HOLIDAY_GUIDANCE = [
  "Public holidays are observed nationwide, but each business sets its own hours. Banks and government offices typically close; restaurants, malls and clubs may open late, close early, or run a special menu.",
  "Anything you are travelling for — a table, a ticket, a ferry — is worth confirming directly with the venue for that specific date.",
  "When a holiday falls at the weekend, the observed day is often moved to the following Monday. Check before you plan around it.",
  "Eid dates are announced after moon sighting rather than fixed in advance, so they are added here once the federal government publishes them.",
];
