import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "../../components/site-footer";
import { ShareActions } from "../../components/share-actions";
import { calendarHref } from "../../lib/ics";
import { imageUrl } from "../../lib/media";
import { getPlace, mapsRoute, type Place } from "../../lib/place";
import {
  dateRange,
  getShow,
  naira,
  type ShowEvent,
} from "../../lib/shows";
import { shortlistHref, splitIds } from "../../lib/shortlist";

type PageProps = {
  searchParams: Promise<{ places?: string; shows?: string }>;
};

const unique = (ids: string[]) => [...new Set(ids)];

async function resolve(searchParams: PageProps["searchParams"]) {
  const { places: placesParam, shows: showsParam } = await searchParams;

  const places = unique(splitIds(placesParam))
    .map(getPlace)
    .filter((place): place is Place => Boolean(place));
  const shows = unique(splitIds(showsParam))
    .map(getShow)
    .filter((show): show is ShowEvent => Boolean(show));

  return { places, shows };
}

const count = (n: number, word: string) =>
  `${n} ${word}${n === 1 ? "" : "s"}`;

function summarise(places: Place[], shows: ShowEvent[]) {
  if (places.length === 0 && shows.length === 0) return "Nothing on it yet";
  return [count(places.length, "place"), count(shows.length, "show")]
    .filter((part) => !part.startsWith("0 "))
    .join(" · ");
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { places, shows } = await resolve(searchParams);
  const summary = summarise(places, shows);

  return {
    title: "A Detty December list — Èkó Season",
    description:
      "A shareable shortlist of Lagos places and December shows, put together with Èkó Season.",
    // Personal links shouldn't be indexed; the pages they point at already are.
    robots: { index: false, follow: true },
    openGraph: {
      title: "A Detty December list",
      description: summary,
      type: "website",
      images: [
        places.length > 0
          ? imageUrl(places[0].gallery[0], 1200, 630)
          : imageUrl("photo-1682944856348-0665d4b8d81c", 1200, 630),
      ],
    },
  };
}

export default async function ListPage({ searchParams }: PageProps) {
  const { places, shows } = await resolve(searchParams);
  const total = places.length + shows.length;
  // Two or more places become a route; a single place already has a map link.
  const route = mapsRoute(places);

  return (
    <main className="bg-cream text-ink">
      <div className="mx-auto max-w-4xl px-6 pt-8 sm:px-10">
        <nav className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted">
          <Link href="/" className="transition hover:text-ink">
            ← Èkó Season
          </Link>
          <Link href="/places" className="transition hover:text-ink">
            Browse places
          </Link>
        </nav>

        <header className="mt-10 border-b border-ink/10 pb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-ember">
            Shared list
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            December shortlist
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            {total > 0
              ? `${summarise(places, shows)} picked from the guide. Send it on, or open anything below for prices and directions.`
              : "This link has no places or shows on it yet. Open any card in the guide and tap the + to start one."}
          </p>

          {total > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {shows.length > 0 && (
                <a
                  href={calendarHref(shows.map((show) => show.id))}
                  className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-xs font-medium transition hover:border-ink/40"
                >
                  Add these {shows.length === 1 ? "show" : "shows"} to your
                  calendar (.ics)
                </a>
              )}
              <ShareActions
                path={shortlistHref([
                  ...places.map((place) => ({
                    kind: "place" as const,
                    id: place.id,
                  })),
                  ...shows.map((show) => ({
                    kind: "show" as const,
                    id: show.id,
                  })),
                ])}
                message={`Detty December in Lagos — ${summarise(places, shows)}`}
              />
              {route && (
                <a
                  href={route}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-xs font-medium transition hover:border-ink/40"
                >
                  Open the route in Maps <span aria-hidden>↗</span>
                </a>
              )}
            </div>
          )}
        </header>

        {places.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-2xl">Places</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {places.map((place) => (
                <Link
                  key={place.id}
                  href={`/places/${place.id}`}
                  className="group flex items-center gap-4 rounded-2xl bg-white/60 p-3 transition hover:bg-white"
                >
                  <img
                    src={imageUrl(place.gallery[0], 240)}
                    alt={place.name}
                    loading="lazy"
                    className="h-20 w-20 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                      {place.area}
                    </p>
                    <p className="mt-0.5 font-display text-lg leading-tight">
                      {place.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted">
                      {place.tagline}
                    </p>
                  </div>
                  {/\d/.test(place.price) && (
                    <span className="shrink-0 self-start rounded-full bg-cream px-2.5 py-1 text-[10px] text-ink/70">
                      {place.price}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {shows.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-2xl">Shows</h2>
            <div className="mt-4 space-y-3">
              {shows.map((show) => (
                <Link
                  key={show.id}
                  href={`/shows/${show.id}`}
                  className="flex flex-col gap-2 rounded-2xl bg-ink p-4 text-cream transition hover:bg-ink/90 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gold">
                      {dateRange(show)}
                    </p>
                    <p className="mt-1 font-display text-lg leading-tight">
                      {show.title}
                    </p>
                    <p className="mt-1 text-xs text-cream/55">
                      {show.venue}
                      {show.area ? `, ${show.area}` : ""}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm text-cream/80 sm:text-right">
                    {show.priceFrom != null
                      ? `From ${naira(show.priceFrom)}`
                      : "Price not published"}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {total === 0 && (
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/places"
              className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-cream transition hover:bg-ember"
            >
              Find places
            </Link>
            <Link
              href="/shows"
              className="rounded-full border border-ink/15 px-5 py-3 text-sm transition hover:border-ink/40"
            >
              See the shows
            </Link>
          </div>
        )}

        <p className="mt-12 border-t border-ink/10 pt-6 text-[11px] leading-relaxed text-muted">
          No account, no tracking: this list lives in the link itself. Prices
          and dates were checked when the page was built — confirm before you
          pay.
        </p>
      </div>

      <div className="mt-auto pt-16">
        <SiteFooter />
      </div>
    </main>
  );
}
