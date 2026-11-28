import type { Metadata } from "next";
import Link from "next/link";
import { BigShows } from "../../components/big-shows";
import { DataStamp } from "../../components/data-stamp";
import { JsonLd } from "../../components/json-ld";
import { SeasonNotice } from "../../components/season-notice";
import { ShowCalendar } from "../../components/show-calendar";
import { Pagination } from "../../components/pagination";
import { showEvents, showSourceHealth } from "../../lib/shows";
import { todayInLagos } from "../../lib/schedule";
import { showIsPast } from "../../lib/season";
import { allPlaces } from "../../lib/place";
import { SITE_URL, SOCIAL_IMAGE } from "../../lib/site";
import { calendarHref } from "../../lib/ics";
import { imageUrl } from "../../lib/media";

const TITLE = "Big shows — Èkó Season";
const DESCRIPTION =
  "Every show announced for Lagos right now, with venue, date and ticket prices.";

/** Twelve cards a page: enough to scan, short enough to reach the footer. */
const PAGE_SIZE = 12;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/shows" },
  openGraph: {
    type: "website",
    siteName: "Èkó Season",
    url: "/shows",
    title: "Big shows in Lagos",
    description: DESCRIPTION,
    images: [
      {
        url: imageUrl(
          (showEvents[0]?.photos?.[0] ?? allPlaces[0]?.gallery[0] ?? SOCIAL_IMAGE) ?? SOCIAL_IMAGE,
          1200,
          630,
        ),
        width: 1200,
        height: 630,
        alt: "Big shows in Lagos",
      },
    ],
  },
};

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function ShowsPage({ searchParams }: PageProps) {
  const { page } = await searchParams;

  // Upcoming shows only; once the season is over the page becomes the archive
  // and the notice above says so.
  const today = todayInLagos();
  const upcoming = showEvents.filter((event) => !showIsPast(event, today));
  const listed = upcoming.length > 0 ? upcoming : showEvents;

  const pageCount = Math.max(1, Math.ceil(listed.length / PAGE_SIZE));
  const current = Math.min(
    Math.max(Number.parseInt(page ?? "1", 10) || 1, 1),
    pageCount,
  );
  const start = (current - 1) * PAGE_SIZE;
  const events = listed.slice(start, start + PAGE_SIZE);

  return (
    <main className="bg-ink">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Big shows in Lagos",
          numberOfItems: listed.length,
          itemListElement: listed.slice(0, 30).map((event, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${SITE_URL}/shows/${event.id}`,
            name: event.title,
          })),
        }}
      />
      <div className="mx-auto max-w-7xl px-6 pt-10 sm:px-10">
        <Link
          href="/"
          className="text-[11px] uppercase tracking-[0.2em] text-cream/50 transition hover:text-cream"
        >
          ← Back to the guide
        </Link>
        <SeasonNotice tone="dark" className="mt-6" />
        <ShowCalendar events={listed} />
      </div>
      <BigShows
        events={events}
        archived={upcoming.length === 0}
        pagination={
          <>
            <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-cream/40">
              Showing {start + 1}–{start + events.length} of {listed.length}
            </p>
            <Pagination
              page={current}
              pageCount={pageCount}
              tone="dark"
              pageHref="/shows?page={page}"
              firstPageHref="/shows"
            />
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href={calendarHref()}
                className="rounded-full border border-cream/25 px-4 py-2 text-xs text-cream transition hover:border-cream/60"
              >
                Add all shows to your calendar (.ics)
              </a>
              <DataStamp kind="shows" tone="dark" />
            </div>
            {showSourceHealth.length > 0 && (
              <p className="mt-2 text-[11px] text-cream/35">
                Sources on the last run:{" "}
                {showSourceHealth
                  .map((source) =>
                    source.ok
                      ? `${source.name} (${source.events})`
                      : `${source.name} (unreachable)`,
                  )
                  .join(" · ")}
                .
              </p>
            )}
          </>
        }
      />
    </main>
  );
}
