import Link from "next/link";
import { sections } from "../data/sections";
import { CardArtwork } from "./card-artwork";
import { ShortlistButton } from "./shortlist";
import { upcomingShows } from "../lib/season";
import {
  dateRange,
  naira,
  showEvents,
  showsUpdatedAt,
  type ShowEvent,
} from "../lib/shows";

function nightsOf(event: ShowEvent) {
  if (!event.endDate || event.endDate === event.date) return 1;
  const start = Date.parse(`${event.date}T12:00:00Z`);
  const end = Date.parse(`${event.endDate}T12:00:00Z`);
  return Math.max(1, Math.round((end - start) / 86_400_000) + 1);
}

export function ShowCard({
  event,
  archived = false,
}: {
  event: ShowEvent;
  archived?: boolean;
}) {
  const artists = event.artists ?? [];
  const nights = nightsOf(event);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-cream/10 bg-cream/[0.04] transition hover:border-cream/25 focus-within:border-cream/40">
      {/* Stretched link: the whole card opens the show page, the ticket
          anchor below sits above it and stays separately clickable. */}
      <Link
        href={`/shows/${event.id}`}
        aria-label={`${event.title} — full details`}
        className="absolute inset-0 z-10 rounded-2xl"
      />

      <div className="relative aspect-[2/1]">
        <CardArtwork
          date={event.date}
          left={nights > 1 ? `${nights} nights` : "One night"}
          right={event.area ?? "Lagos"}
        />

        <ShortlistButton
          kind="show"
          id={event.id}
          name={event.title}
          tone="dark"
          className="absolute right-3 top-3 z-20"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* The artwork already carries the night, so only the cases the band
            cannot show — a run of several nights, or an archived show — get a
            line here. */}
        {nights > 1 && (
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-cream/50">
            {dateRange(event)}
          </p>
        )}
        {archived && (
          <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-cream/40">
            Archive
          </p>
        )}

        <h3 className="line-clamp-2 font-display text-lg leading-snug transition group-hover:text-gold">
          {event.title}
        </h3>

        {artists.length > 0 && (
          <p className="mt-1 line-clamp-1 text-xs text-gold">
            {artists.slice(0, 3).join(" · ")}
            {artists.length > 3 ? " + more" : ""}
          </p>
        )}

        <p className="mt-3 line-clamp-2 text-xs text-cream/55">
          {event.venue}
          {event.area ? `, ${event.area}` : " · Location to be confirmed"}
        </p>
      </div>

      <div className="border-t border-cream/10 p-5 pt-4">
        <p className="text-sm font-medium">
          {event.priceFrom != null
            ? `From ${naira(event.priceFrom)}`
            : "Price not published"}
        </p>

        {event.tiers.length > 0 && (
          <ul className="mt-2 space-y-1 text-[11px] text-cream/50">
            {event.tiers.slice(0, 3).map((tier) => (
              <li key={tier.name} className="flex justify-between gap-4">
                <span className={tier.soldOut ? "line-through" : ""}>
                  {tier.name.trim()}
                </span>
                <span>{naira(tier.price)}</span>
              </li>
            ))}
          </ul>
        )}

        {archived ? (
          <p className="mt-4 text-[11px] text-cream/35">
            This show has finished. Details are kept for reference.
          </p>
        ) : event.ticketUrl && event.ticketStatus !== "dead" ? (
          <a
            href={event.ticketUrl}
            target="_blank"
            rel="noreferrer"
            className="relative z-20 mt-4 inline-block rounded-full bg-gold px-4 py-2 text-xs font-semibold text-ink transition hover:bg-cream"
          >
            Tickets
          </a>
        ) : (
          <p className="mt-4 text-[11px] text-cream/35">
            {event.ticketStatus === "dead"
              ? "Ticket link is down — check the show page."
              : "Ticket link not announced yet."}
          </p>
        )}
      </div>
    </article>
  );
}

export function BigShows({
  events = upcomingShows(),
  pagination,
  archived = false,
}: {
  events?: ShowEvent[];
  pagination?: React.ReactNode;
  /** Past shows kept for reference; ticket links would be misleading. */
  archived?: boolean;
} = {}) {
  return (
    <section id="shows" className="bg-ink px-6 py-20 text-cream sm:px-10 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">
              {sections.shows.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              {sections.shows.title}
            </h2>
          </div>
          <div className="max-w-sm">
            <p className="text-sm leading-relaxed text-cream/55">
              The December calendar, refreshed automatically from the festival
              and ticket pages. Prices are face value before booking fees.
            </p>
            <Link
              href="/tonight"
              className="mt-3 inline-flex items-center gap-2 text-xs text-gold underline-offset-4 hover:underline"
            >
              What&rsquo;s on tonight
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-cream/15 bg-cream/[0.04] p-6">
            <p className="font-display text-xl">No shows announced yet</p>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-cream/60">
              The December calendar fills up from September, when venues publish
              their line-ups. Nothing is invented between announcements — what is
              still open all year is below: where to eat, where to go and how to
              get around.
            </p>
            <Link
              href="/places"
              className="mt-4 inline-flex items-center gap-2 text-xs text-gold underline-offset-4 hover:underline"
            >
              Places that are open now <span aria-hidden>→</span>
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <ShowCard key={event.id} event={event} archived={archived} />
            ))}
          </div>
        )}

        <p className="mt-8 text-[11px] text-cream/35">
          Data updated{" "}
          {new Date(showsUpdatedAt).toLocaleDateString("en-GB")} ·{" "}
          {showEvents.length} shows tracked. Confirm on the ticket page before
          paying.
        </p>

        {pagination}
      </div>
    </section>
  );
}
