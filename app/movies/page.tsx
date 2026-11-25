import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "../../components/site-footer";
import { CardArtwork } from "../../components/card-artwork";
import { DataStamp } from "../../components/data-stamp";
import { SeasonNotice } from "../../components/season-notice";
import { JsonLd } from "../../components/json-ld";
import {
  movieEvents,
  movieSourceHealth,
  screeningAtLagosCinemas,
  type MovieEvent,
} from "../../lib/movies";
import { allPlaces, getPlace } from "../../lib/place";
import { imageSrcSet, imageUrl } from "../../lib/media";
import { todayInLagos } from "../../lib/schedule";
import { SITE_URL } from "../../lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Movies in Lagos — Èkó Season",
  description:
    "Nollywood and cinema releases screening in Lagos this December, with venues, release dates and ticket links.",
  alternates: { canonical: "/movies" },
  openGraph: {
    type: "website",
    siteName: "Èkó Season",
    url: "/movies",
    title: "Movies in Lagos this December",
    description:
      "What's in Nigerian cinemas now and what's coming — Nollywood releases, venues and where to buy tickets.",
    // The social card is app/movies/opengraph-image.tsx.
  },
};

const LAGOS_CINEMA_IDS = ["ebonylife-cinemas", "silverbird-galleria", "ozone-cinemas", "purple-maryland", "dream-park"];

function cinemaTag(cinemaId: string) {
  const place = getPlace(cinemaId);
  if (!place) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-ink/10 px-3 py-1 text-xs text-ink">
      <span className="text-gold" aria-hidden>●</span>
      {place.name}
    </span>
  );
}

function MovieCard({ movie, today }: { movie: MovieEvent; today: string }) {
  const lagosCinemas = screeningAtLagosCinemas(movie);
  // Running dates end: a film that opened in November is not "now showing"
  // in February just because its start date is in the past.
  const nowShowing =
    movie.date <= today && (movie.endDate ?? movie.date) >= today;
  const comingSoon = movie.date > today;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-cream/10 bg-white/60 transition hover:border-cream/30 hover:shadow-[0_20px_40px_-20px_rgba(23,16,11,0.3)]">
      {/* Every card opens with artwork, so the grid stays image-led like the
          places and dishes grids. */}
      <div className="relative aspect-[16/9] overflow-hidden bg-ink">
        <CardArtwork date={movie.date} left="In Nigerian cinemas" />
        {/* The band already carries the date, so the chip only states status. */}
        <span className="absolute right-3 top-3 rounded-full bg-cream/95 px-3 py-1 text-[11px] font-medium text-ink">
          {nowShowing ? "Now showing" : comingSoon ? "Coming soon" : "Finished"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="line-clamp-2 font-display text-2xl leading-snug transition group-hover:text-gold">
            {movie.title}
          </h3>

          {movie.note ? (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink/75">
              {movie.note}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
                      {lagosCinemas.map((id) => {
              const tag = cinemaTag(id);
              return tag ? <span key={id}>{tag}</span> : null;
            })}
          {lagosCinemas.length === 0 && movie.cinemas.length > 0 && (
            <p className="text-xs text-muted">
              Screening at {movie.cinemas[0].name}{movie.cinemas[0].area ? `, ${movie.cinemas[0].area}` : ""}
              {movie.cinemas.length > 1 ? ` +${movie.cinemas.length - 1} more` : ""}
            </p>
          )}
        </div>

        {movie.cinemas.length > 0 && movie.cinemas[0].url ? (
          <a
            href={movie.cinemas[0].url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream transition hover:bg-ember"
          >
            Check showtimes
            <span aria-hidden>↗</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}

function BestCinemaCard({ place }: { place: (typeof allPlaces)[0] }) {
  return (
    // A div, not a Link: the card holds its own "Open in Maps" anchor, and an
    // <a> inside an <a> is invalid and breaks hydration.
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-cream/10 bg-white/60 transition hover:border-cream/30 hover:shadow-[0_20px_40px_-20px_rgba(23,16,11,0.3)]">
      <Link
        href={`/places/${place.id}`}
        aria-label={`${place.name}, ${place.area}`}
        className="absolute inset-0 z-10 rounded-2xl"
      />
      <img
        src={imageUrl(place.gallery[0], 900)}
        srcSet={imageSrcSet(place.gallery[0])}
        sizes="(min-width: 1024px) 30vw, 92vw"
        alt={place.name}
        loading="lazy"
        decoding="async"
        className="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
      />

      <div className="flex flex-1 flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{place.area}</p>
          <h3 className="mt-1 font-display text-xl leading-snug group-hover:text-gold transition">
            {place.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink/75">{place.tagline}</p>
        </div>
        <span className="shrink-0 rounded-full bg-ink px-3 py-1 text-xs font-medium text-cream">
          {place.price}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-ink/75">{place.note}</p>

      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address ?? place.name)}`}
        target="_blank"
        rel="noreferrer"
        className="relative z-20 mt-2 inline-flex items-center gap-2 self-start rounded-full bg-ink/90 px-4 py-2 text-xs font-medium text-cream transition hover:bg-ember"
      >
        Open in Maps
        <span aria-hidden>↗</span>
      </a>
      </div>
    </div>
  );
}

export default function MoviesPage() {
  // "Now showing" is a fact about today, not about the day this file changed.
  const today = todayInLagos();
  const nowShowing = movieEvents.filter(
    (m) => m.date <= today && (m.endDate ?? m.date) >= today,
  );
  const comingSoon = movieEvents.filter((m) => m.date > today);
  const lagosCinemas = allPlaces.filter((p) => LAGOS_CINEMA_IDS.includes(p.id));

  return (
    <main className="bg-cream text-ink">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Movies in Lagos this December",
          numberOfItems: movieEvents.length,
          itemListElement: movieEvents.map((movie, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Movie",
              name: movie.title,
              datePublished: movie.date,
              url: `${SITE_URL}/movies`,
              ...(movie.note ? { description: movie.note } : {}),
            },
          })),
        }}
      />
      <div className="mx-auto max-w-7xl px-6 pt-8 sm:px-10">
        <nav className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted">
          <Link href="/" className="transition hover:text-ink">
            ← Èkó Season
          </Link>
          <Link href="/shows" className="transition hover:text-ink">
            Big shows
          </Link>
        </nav>

        <header className="mt-10 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-ember">Screen time</p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            Movies in Lagos
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            What's on in Nigerian cinemas now and what's coming this December — Nollywood releases, where to watch them,
            and the Lagos cinemas worth choosing. Updated from cinema listings and release trackers.
          </p>
        </header>

        <SeasonNotice className="mt-8" />

        {nowShowing.length === 0 && comingSoon.length === 0 && (
          <p className="mt-10 text-sm text-muted">
            No films are listed for this season yet. Release dates are added
            from the distributors&rsquo; own announcements.
          </p>
        )}

        {nowShowing.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl">Now in cinemas</h2>
            <p className="mt-2 text-sm text-muted">
              These are already playing in Lagos or opening this week.
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {nowShowing.map((movie) => (
                <MovieCard key={movie.id} movie={movie} today={today} />
              ))}
            </div>
          </section>
        )}

        {comingSoon.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl">Coming to cinemas</h2>
            <p className="mt-2 text-sm text-muted">
              Scheduled releases this December — dates are what the distributor announced, so confirm on the cinema page before you travel.
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {comingSoon.map((movie) => (
                <MovieCard key={movie.id} movie={movie} today={today} />
              ))}
            </div>
          </section>
        )}

        {lagosCinemas.length > 0 && (
          <section className="mt-16 border-t border-ink/10 pt-10">
            <h2 className="font-display text-2xl">Best cinemas in Lagos</h2>
            <p className="mt-2 text-sm text-muted">
              The Lagos cinemas in the guide. EbonyLife and Silverbird Galleria are the ones to pick for Nollywood premieres;
              Ozone is the pick on the mainland.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lagosCinemas.map((place) => (
                <BestCinemaCard key={place.id} place={place} />
              ))}
            </div>
          </section>
        )}

        <DataStamp kind="movies" className="mt-10" />

        {movieSourceHealth.length > 0 && (
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            Sources on the last run:{" "}
            {movieSourceHealth
              .map((source) =>
                source.ok
                  ? `${source.name} (${source.films} film${source.films === 1 ? "" : "s"})`
                  : `${source.name} (unreachable)`,
              )
              .join(" · ")}
            .
          </p>
        )}

        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          Release dates and cinema line-ups from{" "}
          <a
            href="https://silverbirdcinemas.com/"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
          >
            Silverbird Cinemas
          </a>{" "}
          and Nollywood release trackers. Showtimes change — check the cinema page on the day.
          Weather not great?{" "}
          <Link
            href="/weather"
            className="underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
          >
            Check the forecast first
          </Link>
          .
        </p>
      </div>

      <div className="mt-auto pt-20">
        <SiteFooter />
      </div>
    </main>
  );
}
