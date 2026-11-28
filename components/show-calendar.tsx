import { addDays, monthEnd, monthLabel, monthStart } from "../lib/schedule";
import type { ShowEvent } from "../lib/shows";

/**
 * The calendar at a glance: which nights are crowded and which weekends are
 * worth planning around. Cards below answer "what is it"; this answers "when".
 *
 * One grid per month that has a night on it, so a listing that runs from
 * November into January is not silently cut off at the first month.
 */

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
/** Three months is what anyone plans across; beyond that the list is better. */
const MAX_MONTHS = 3;

const coversDay = (event: ShowEvent, date: string) =>
  event.date <= date && (event.endDate ?? event.date) >= date;

function MonthGrid({ from, events }: { from: string; events: ShowEvent[] }) {
  const to = monthEnd(from);
  const leading = (new Date(`${from}T00:00:00Z`).getUTCDay() + 6) % 7;
  const length = Number(to.slice(8, 10));

  const onThisMonth = events.filter(
    (event) => event.date <= to && (event.endDate ?? event.date) >= from,
  );

  const days = Array.from({ length }, (_, index) => {
    const date = addDays(from, index);
    return {
      date,
      day: index + 1,
      events: events.filter((event) => coversDay(event, date)),
    };
  });

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl text-cream">{monthLabel(from)}</h2>
        <p className="text-[11px] uppercase tracking-[0.2em] text-cream/40">
          {onThisMonth.length} show{onThisMonth.length === 1 ? "" : "s"}
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
    </div>
  );
}

export function ShowCalendar({ events }: { events: ShowEvent[] }) {
  if (events.length === 0) return null;

  // Both ends of a run, so a show that spills into the next month gets a grid
  // for that month too.
  const months = [
    ...new Set(
      events.flatMap((event) => [
        event.date.slice(0, 7),
        (event.endDate ?? event.date).slice(0, 7),
      ]),
    ),
  ]
    .sort()
    .slice(0, MAX_MONTHS)
    .map((month) => monthStart(`${month}-01`));

  return (
    <section className="mt-10" aria-label="Shows by month">
      <div className="space-y-10">
        {months.map((from) => (
          <MonthGrid key={from} from={from} events={events} />
        ))}
      </div>

      <p className="mt-3 text-[11px] text-cream/35">
        Multi-night shows appear on every night they run.
      </p>
    </section>
  );
}
