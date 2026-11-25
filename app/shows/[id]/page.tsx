import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "../../../components/site-footer";
import { JsonLd } from "../../../components/json-ld";
import { ShareActions } from "../../../components/share-actions";
import { ReportLink } from "../../../components/report-link";
import { imageUrl, photoCredit, venuePhotos, galleryAltText, showFallbackAlt } from "../../../lib/media";
import { dateRange, showEvents } from "../../../lib/shows";
import { SITE_URL, SOCIAL_IMAGE } from "../../../lib/site";
import { calendarHref } from "../../../lib/ics";

type Props = { params: Promise<{ id: string }> };

export default async function ShowPage({ params }: Props) {
  const { id } = await params;
  const show = showEvents.find((s) => s.id === id);
  if (!show) notFound();

  const showTickets: any[] = (show as any).tickets ?? [];
  const leadImage: string | undefined = (show as any).leadImage;
  const showPhotos: string[] = (show as any).photos ?? [];
  const gallery = [
    ...(leadImage ? [imageUrl(String(leadImage))] : []),
    ...showPhotos.map((p: string) => imageUrl(p)),
  ];
  // A show with no photography at all still needs a lead image to render.
  if (gallery.length === 0) gallery.push(SOCIAL_IMAGE);
  const credits = venuePhotos(gallery)
    .map(photoCredit)
    .filter((credit): credit is NonNullable<typeof credit> => Boolean(credit));
  const leadCredit = photoCredit(gallery[0]);
  const leadAlt = galleryAltText(gallery[0]);

  const moreHtml = showPhotos.length > 1 ? (
    <>
      <p className="mt-3 text-[11px] text-muted uppercase tracking-[0.2em]">
        More {show.title?.split('(')[0]}
      </p>
      <div className="mt-2 grid grid-cols-3 gap-3">
        {showPhotos.slice(1).map((photog: string) => {
          const credit = photoCredit(photog);
          return (
            <figure key={photog} className="overflow-hidden rounded-2xl">
              <img
                src={imageUrl(photog)}
                alt={showFallbackAlt(show.title, photog)}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
              {credit && (
                <figcaption className="mt-1 text-[10px] text-muted">
                  {credit.author} ({credit.license})
                </figcaption>
              )}
            </figure>
          );
        })}
      </div>
    </>
  ) : null;

  const startDate = show.date;
  const endDate = show.endDate ?? show.date;

  return (
    <main className="min-h-screen bg-cream">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: show.title,
          startDate,
          endDate,
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          description: show.note ?? `${show.title} at ${show.venue}, Lagos.`,
          url: `${SITE_URL}/shows/${show.id}`,
          image: gallery.slice(0, 3),
          location: {
            "@type": "Place",
            name: show.venue,
            address: {
              "@type": "PostalAddress",
              addressLocality: show.area ?? show.city,
              addressRegion: "Lagos",
              addressCountry: "NG",
            },
          },
          ...(show.priceFrom != null
            ? {
                offers: {
                  "@type": "Offer",
                  price: show.priceFrom,
                  priceCurrency: show.currency,
                  availability: "https://schema.org/InStock",
                  url: show.ticketUrl ?? `${SITE_URL}/shows/${show.id}`,
                },
              }
            : {}),
        }}
      />
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-8 sm:px-10">
        <nav className="flex items-center text-[11px] uppercase tracking-[0.2em] text-muted">
          <Link href="/" className="transition hover:text-ink">
            Ekó Season
          </Link>
          <span className="text-ink/30">/</span>
          <Link href="/shows" className="transition hover:text-ink">
            Shows
          </Link>
          <span className="text-ink/30">/</span>
          <span className="text-white/70">{show.title}</span>
        </nav>

        <div className="mt-6 flex flex-col items-start gap-2 sm:mt-8 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-4xl text-ink sm:text-5xl">
              {show.title}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {show.date} · {show.venue} · {show.area}
            </p>
          </div>
        </div>

        <div className="mt-8 relative overflow-hidden rounded-2xl">
          <div className="aspect-[16/9]">
            <img
              src={gallery[0]}
              alt={showFallbackAlt(show.title, gallery[0]) ?? show.title}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {moreHtml}

        <p className="mt-2 text-[11px] text-muted">
          {leadCredit?.venue
            ? `Photography: ${leadCredit.author} (${leadCredit.license}) - ${leadCredit.source ?? "Wikimedia Commons"}. More on the page below.`
            : "Illustrative photography - not the venue itself."}
          {credits.length > 0 &&
            " " + `More from ${leadCredit?.source ?? "Wikimedia Commons"}: ${credits.map((credit) => credit.author + " (" + credit.license + ")").join(", ")}.`}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted">When</span>
            <p className="text-sm">{show.date}</p>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted">Learn more</span>
            <p className="text-sm">{show.note ?? 'No description.'}</p>
          </div>
        </div>

        {showTickets.length > 0 && (
          <div className="mt-6 border-t border-ink/10 pt-6">
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted">Tickets</span>
            <ul className="mt-3 list-disc list-inside text-[14px] text-ember">
              {showTickets.map((ticket: any) => (
                <li key={ticket.id}>
                  <a
                    href={ticket.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-left no-underline text-ember transition hover:underline"
                  >
                    {ticket.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 border-t border-ink/10 pt-6">
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted">Report a problem</span>
          <p className="mt-2 text-sm">
            <ReportLink
              page={`/shows/${show.id}`}
              about="this show moved, has the wrong date, wrong price or a wrong night"
            />
          </p>

          <span className="mt-3 block text-[11px] uppercase tracking-[0.2em] text-muted">Share &amp; save</span>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ShareActions
              path={`/shows/${show.id}`}
              message={`${show.title} — ${dateRange(show)} at ${show.venue}, Lagos`}
            />
            <a
              href={calendarHref([show.id])}
              className="rounded-full border border-ink/15 px-5 py-3 text-sm font-medium text-ink transition hover:border-ink/40"
            >
              Add to calendar (.ics)
            </a>
          </div>
        </div>

      </div>

      <div className="mt-auto pt-16">
        <SiteFooter />
      </div>
    </main>
  );
}
