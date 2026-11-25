import Link from "next/link";
import { sections } from "../data/sections";
import {
  addDays,
  planDay,
  shortDay,
  todayInLagos,
  weekdayLong,
} from "../lib/schedule";

/**
 * "Tonight and this week": today plus the next two days, so the home page
 * shows what is actually on rather than only the December calendar. Server
 * rendered — the home page carries a revalidate window to keep it current.
 */
export function TonightStrip() {
  const today = todayInLagos();
  const days = Array.from({ length: 3 }, (_, offset) =>
    planDay(addDays(today, offset)),
  );

  return (
    <section className="border-y border-ink/10 bg-sand px-6 py-10 sm:px-10 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl sm:text-3xl">
            {sections.tonight.title}
          </h2>
          <Link
            href="/tonight"
            className="text-xs text-ink/70 underline-offset-4 transition hover:text-ink hover:underline"
          >
            The full week in Lagos <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {days.map((day, index) => {
            const items = [
              ...day.shows.map((event) => ({
                key: `show-${event.id}`,
                label: event.title,
                href: `/shows/${event.id}`,
                kind: "Show" as const,
              })),
              ...day.clubs.map((place) => ({
                key: `place-${place.id}`,
                label: place.name,
                href: `/places/${place.id}`,
                kind: "Night" as const,
              })),
            ];
            const shown = items.slice(0, 3);
            const extra = items.length - shown.length;

            return (
              <article
                key={day.date}
                className="rounded-2xl border border-ink/10 bg-cream/70 p-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-ember">
                    {index === 0 ? "Tonight" : weekdayLong(day.date)}
                  </p>
                  <p className="text-[11px] text-muted">{shortDay(day.date)}</p>
                </div>

                {items.length === 0 ? (
                  <p className="mt-3 text-sm text-muted">Quiet night.</p>
                ) : (
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {shown.map((item) => (
                      <li key={item.key} className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ember/60" aria-hidden />
                        <Link
                          href={item.href}
                          className="text-ink/85 underline-offset-4 transition hover:text-ember hover:underline"
                        >
                          {item.label}
                          <span className="sr-only"> ({item.kind})</span>
                        </Link>
                      </li>
                    ))}
                    {extra > 0 && (
                      <li className="pl-3 text-[11px] text-muted">
                        <Link
                          href="/tonight"
                          className="underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
                        >
                          +{extra} more
                        </Link>
                      </li>
                    )}
                  </ul>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
