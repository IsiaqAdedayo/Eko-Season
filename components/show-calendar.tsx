import { addDays } from "../lib/schedule";
import type { ShowEvent } from "../lib/shows";

/**
 * December at a glance: which nights are crowded and which weekends are worth
 * planning around. Cards below answer "what is it"; this answers "when is it".
 */

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const monthLabel = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`));

export function ShowCalendar({ events }: { events: ShowEvent[] }) {
  if (events.length === 0) return null;

  // The grid covers the month the first listed show falls in.
  const monthStart = `${events.map((e) => e.date).sort()[0].slice(0, 7)}-01`;
  const [year, month] = monthStart.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const leading = (new Date(`${monthStart}T00:00:00Z`).getUTCDay() + 6) % 7;

  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const date = addDays(monthStart, index);
    return {
      date,
      day: index + 1,
      events: events.filter(
        (event) => event.date <= date && (event.endDate ?? event.date) >= date,
      ),
    };
  });

  return (
    <section className="mt-10" aria-labelledby="show-calendar-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="show-calendar-heading" className="font-display text-2xl text-cream">
          {monthLabel(monthStart)}
        </h2>
        <p className="text-[11px] uppercase tracking-[0.2em] text-cream/40">
          {events.length} show{events.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-cream">
        {WEEKDAYS.map((label) => (
          <div
            key={label}
            className="pb-1 text-center text-[10px] uppercase tracking-[0.16em] text-cream/35"
          >
            {label}
          </div>
        ))}

        {Array.from({ length: leading }, (_, index) => (
          <div key={`blank-${index}`} aria-hidden />
        ))}

        {days.map(({ date, day, events: onDay }) => (
          <div
            key={date}
            className={`min-h-[52px] rounded-lg border p-1 sm:min-h-[74px] sm:p-1.5 ${
              onDay.length > 0
                ? "border-cream/20 bg-cream/[0.06]"
                : "border-cream/[0.06]"
            }`}
          >
            <p className="text-[11px] text-cream/55">{day}</p>
            {onDay.length > 0 && (
              <>
                <p className="mt-1 whitespace-nowrap text-[9px] font-medium text-gold sm:text-[10px]">
                  {onDay.length} show{onDay.length === 1 ? "" : "s"}
                </p>
                <p className="mt-0.5 hidden text-[10px] leading-tight text-cream/55 sm:block">
                  {onDay[0].title.length > 26
                    ? `${onDay[0].title.slice(0, 25)}…`
                    : onDay[0].title}
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      <p className="mt-3 text-[11px] text-cream/35">
        Multi-night shows appear on every night they run.
      </p>
    </section>
  );
}
