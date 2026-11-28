import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "../../components/site-footer";
import { moviesFreshness, showsFreshness } from "../../lib/freshness";
import { allPlaces, placeProvenance } from "../../lib/place";
import { formatChecked } from "../../lib/site";

// The page prints how old the data is, so it must not freeze at build time.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Sources — Èkó Season",
  description:
    "Where the Lagos listings come from, how often they are refreshed, and what the difference is between a listed place and a verified one.",
  alternates: { canonical: "/sources" },
  openGraph: {
    type: "website",
    siteName: "Èkó Season",
    url: "/sources",
    title: "Sources and dates",
    description:
      "The feeds behind the guide, the refresh schedule, and what a listed date means next to a verified one.",
  },
};

const FEEDS = [
  {
    name: "Shows and events",
    detail:
      "Eventbrite Lagos party, nightlife, music and free feeds, plus the Detty December Fest calendar. Ticket prices are read from each ticket page; a price is never typed in by hand.",
  },
  {
    name: "Cinema releases",
    detail:
      "NaijaSabi's monthly release slate, corroborated by the African Movie Database. The scraper reads whatever month the page names and refuses to publish a slate whose dates are all in the past.",
  },
  {
    name: "Places",
    detail:
      "No scraper: venues are checked by hand against their own sites, their Google listings and recent reviews. That is slower, and it is the only way an address, a closure or a price band gets confirmed.",
  },
];

export default function SourcesPage() {
  const places = allPlaces;
  const verified = places.filter((place) => place.verifiedAt);
  const unconfirmed = places.filter((place) => place.verifiedAt === null);
  const oldest = places
    .map((place) => placeProvenance(place).date)
    .sort()
    .at(0);

  const shows = showsFreshness();
  const movies = moviesFreshness();

  return (
    <main className="bg-cream text-ink">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-10 sm:py-24">
        <p className="text-xs uppercase tracking-[0.3em] text-ember">
          How this guide is made
        </p>
        <h1 className="mt-4 font-display text-4xl leading-tight sm:text-6xl">
          Sources and dates
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted">
          Every row here came from somewhere, and every date on a card means
          something specific. This page says what.
        </p>

        <section className="mt-14">
          <h2 className="font-display text-2xl">Two kinds of date</h2>
          <dl className="mt-4 divide-y divide-ink/10 text-sm">
            <div className="py-4">
              <dt className="font-medium">Listed</dt>
              <dd className="mt-1 leading-relaxed text-muted">
                The row was read from a source on that date. It is what the
                source said, not what a person confirmed. Most of the catalogue
                starts here.
              </dd>
            </div>
            <div className="py-4">
              <dt className="font-medium">Verified</dt>
              <dd className="mt-1 leading-relaxed text-muted">
                Someone checked the address, trading status and price band
                against the venue's own information. A place showing a listed
                date instead has not had that check, and its card says so.
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl">Where the rows come from</h2>
          <ul className="mt-4 space-y-5 text-sm">
            {FEEDS.map((feed) => (
              <li key={feed.name}>
                <p className="font-medium">{feed.name}</p>
                <p className="mt-1 leading-relaxed text-muted">{feed.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl">How current it is</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li>
              Shows: last refreshed {shows.label} (
              {formatChecked(shows.iso.slice(0, 10))}).
            </li>
            <li>
              Cinema: last refreshed {movies.label} (
              {formatChecked(movies.iso.slice(0, 10))}).
            </li>
            <li>
              Places: {verified.length} of {places.length} have a verified
              date{unconfirmed.length > 0 ? `, and ${unconfirmed.length} are explicitly unconfirmed` : ""}
              . The oldest date on any live card is {formatChecked(oldest)}.
            </li>
            <li>
              The weekly job fails when a feed is more than ten days old, when
              the cinema slate has ten days or fewer left, or when a place is
              past its re-check limit — ninety days for restaurants, longer for
              things that do not close overnight. A failure raises a desktop
              notification; if the job stops running altogether, the health
              check notices that too.
            </li>
          </ul>
        </section>

        <section className="mt-14 border-t border-ink/10 pt-8">
          <h2 className="font-display text-2xl">When something is wrong</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Venues close, addresses move and prices change — that is expected,
            not a scandal. What this guide avoids is presenting a date as proof
            it did not earn. A card that says <em>listed</em> is asking to be
            checked; if you spot a closure or a moved address before we do, say
            so wherever you found this guide and the row gets corrected, with
            the date it happened.
          </p>
          <p className="mt-6 text-sm">
            <Link
              href="/places"
              className="underline decoration-ink/25 underline-offset-4 hover:text-ember"
            >
              Browse the places →
            </Link>
          </p>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
