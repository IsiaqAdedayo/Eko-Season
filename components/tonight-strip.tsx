import Link from "next/link";
import { sections } from "../data/sections";
import {
  addDays,
  partiesBetween,
  planDay,
  shortDay,
  todayInLagos,
  weekdayLong,
} from "../lib/schedule";
import { isParty, priceLabel, type ShowEvent } from "../lib/shows";

/** A party is labelled as one: the word is the reason people open this strip. */
const kindOf = (event: ShowEvent) => (isParty(event) ? "Party" : "Show");

/** The card's price line, or nothing at all when no price is published. */
const priceOf = (event: ShowEvent) =>
  event.priceFrom == null && !event.freeTicket ? null : priceLabel(event);

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
  const parties = partiesBetween(today, 7);

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
                meta: [kindOf(event), priceOf(event)].filter(Boolean).join(" · "),
                party: isParty(event),
              })),
              ...day.clubs.map((place) => ({
                key: `place-${place.id}`,
                label: place.name,
                href: `/places/${place.id}`,
                meta: "Night",
                party: false,
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
                        <span
                          className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${
                            item.party ? "bg-ember" : "bg-ember/60"
                          }`}
                          aria-hidden
                        />
                        <span className="min-w-0">
                          <Link
                            href={item.href}
                            className="text-ink/85 underline-offset-4 transition hover:text-ember hover:underline"
                          >
                            {item.label}
                          </Link>
                          {item.meta && (
                            <span className="ml-1.5 whitespace-nowrap text-[11px] text-muted">
                              {item.meta}
                            </span>
                          )}
                        </span>
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

        {parties.length > 0 && (
          <p className="mt-4 text-xs text-ink/70">
            <Link
              href="/tonight#parties"
              className="underline decoration-ink/25 underline-offset-4 transition hover:text-ember hover:decoration-ember"
            >
              {parties.length} parties and raves in the next seven days
            </Link>
            {" "}— soonest first, island and mainland.
          </p>
        )}
      </div>
    </section>
  );
}
