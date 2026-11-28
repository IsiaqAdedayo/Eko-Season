import type { ShowEvent } from "./shows";

/**
 * A calendar feed for the shows currently listed, whatever month they fall in.
 *
 * Dates in data/shows.json are calendar dates without a published start time,
 * so every event is exported as an all-day entry. Inventing an 8pm start would
 * put people at a venue hours before the doors open.
 */

const PRODID = "-//Eko Season//Lagos Guide//EN";

/** RFC 5545: backslash, semicolon, comma and newlines need escaping. */
const escapeText = (value: string) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");

/** Lines longer than 75 octets are folded with a leading space. */
function fold(line: string): string {
  if (Buffer.byteLength(line, "utf8") <= 75) return line;

  const parts: string[] = [];
  let current = "";
  let size = 0;

  for (const char of line) {
    const bytes = Buffer.byteLength(char, "utf8");
    // 74 leaves room for the single leading space on continuation lines.
    if (size + bytes > 74) {
      parts.push(current);
      current = char;
      size = bytes;
    } else {
      current += char;
      size += bytes;
    }
  }
  parts.push(current);

  return parts.join("\r\n ");
}

/** All-day dates are exclusive at the end, so a one-day show needs +1. */
function nextDay(iso: string) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

const compactDate = (iso: string) => iso.replace(/-/g, "");

export function showsToIcs(
  events: ShowEvent[],
  calendarName = "Èkó Season — Lagos shows",
) {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${PRODID}`,
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapeText(calendarName)}`,
  ];

  for (const event of events) {
    const last = event.endDate ?? event.date;
    const description = [
      event.note,
      [event.venue, event.area, event.city].filter(Boolean).join(", "),
      event.ticketUrl ? `Tickets: ${event.ticketUrl}` : null,
      `Listed on Èkó Season: /shows/${event.id}`,
    ]
      .filter(Boolean)
      .join("\n");

    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.id}@ekoseason`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compactDate(event.date)}`,
      `DTEND;VALUE=DATE:${compactDate(nextDay(last))}`,
      `SUMMARY:${escapeText(event.title)}`,
      `LOCATION:${escapeText(
        [event.venue, event.area, event.city].filter(Boolean).join(", "),
      )}`,
      `DESCRIPTION:${escapeText(description)}`,
    );

    if (event.ticketUrl) lines.push(`URL:${event.ticketUrl}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return `${lines.map(fold).join("\r\n")}\r\n`;
}

/** `/api/calendar?shows=a,b`; no ids means the whole calendar. */
export function calendarHref(ids: string[] = []) {
  const clean = ids.map((id) => id.trim()).filter(Boolean);
  return clean.length > 0
    ? `/api/calendar?shows=${clean.join(",")}`
    : "/api/calendar";
}
