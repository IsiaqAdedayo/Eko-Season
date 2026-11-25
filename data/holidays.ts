/**
 * Nigerian public holidays that land inside the Detty December window.
 *
 * Only the gazetted name and date are recorded here. What individual venues do
 * on those days is not something this project can verify, so the page states
 * general guidance separately instead of pretending to know opening hours.
 */
export type Holiday = {
  date: string; // ISO, the gazetted day
  name: string;
};

export const DECEMBER_HOLIDAYS: Holiday[] = [
  { date: "2026-12-25", name: "Christmas Day" },
  { date: "2026-12-26", name: "Boxing Day" },
  { date: "2027-01-01", name: "New Year's Day" },
];

/**
 * General guidance, deliberately not venue-specific: public holidays usually
 * mean reduced hours somewhere, and only the venue can confirm its own.
 */
export const HOLIDAY_GUIDANCE = [
  "Public holidays are observed nationwide, but each business sets its own hours. Banks and government offices typically close; restaurants, malls and clubs may open late, close early, or run a special menu.",
  "Anything you are travelling for — a table, a ticket, a ferry — is worth confirming directly with the venue for that specific date.",
  "When a holiday falls at the weekend, the observed day is often moved to the following Monday. Check before you plan around it.",
];

export const nextHoliday = (today: string) =>
  DECEMBER_HOLIDAYS.find((holiday) => holiday.date >= today) ?? null;
