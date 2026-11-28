import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "../../../components/site-footer";
import { JsonLd } from "../../../components/json-ld";
import { ShortlistButton } from "../../../components/shortlist";
import {
  imageSrcSet,
  imageUrl,
  photoCredit,
  venuePhotos,
  galleryAltText,
  placeFallbackAlt,
} from "../../../lib/media";
import {
  CATEGORY_LABELS,
  allPlaces,
  getPlace,
  hasSourcedNights,
  mapUrl,
  placeProvenance,
  nightsLabel,
  type Place,
} from "../../../lib/place";
import { SITE_URL, formatChecked, SOCIAL_IMAGE } from "../../../lib/site";
import { ReportLink } from "../../../components/report-link";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return allPlaces.map((place) => ({ id: place.id }));
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { id } = await params;
  const place = getPlace(id);
  if (!place) return { title: "Place not found — Èkó Season" };

  const title = `${place.name}, ${place.area}`;
  const description = `${place.tagline}. ${place.note}`;
  const url = `/places/${place.id}`;

  return {
    title: `${title} — Èkó Season`,
    description,
    alternates: { canonical: url },
    // The social card is app/places/[id]/opengraph-image.tsx.
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: "Èkó Season",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

function nearby(place: Place) {
  const sameArea = allPlaces.filter(
    (item) => item.id !== place.id && item.area === place.area,
  );
  const sameCategory = allPlaces.filter(
    (item) =>
      item.id !== place.id &&
      item.area !== place.area &&
      item.category === place.category,
  );
  return [...sameArea, ...sameCategory].slice(0, 3);
}

export default async function PlacePage({ params }: Props) {
  const { id } = await params;
  const place = getPlace(id);
  if (!place) notFound();

  const category = CATEGORY_LABELS[place.category] ?? place.category;
  const suggestions = nearby(place);
  const credits = venuePhotos(place.gallery)
    .map(photoCredit)
    .filter((credit): credit is NonNullable<typeof credit> => Boolean(credit))
    .filter(
      (credit, index, all) =>
        all.findIndex((c) => c.author === credit.author) === index,
    );
  const leadCredit = photoCredit(place.gallery[0]);
  // The lead credit is already printed above, so the "More from" line must not
  // repeat it — otherwise a two-photo gallery prints the same sentence twice.
  const moreCredits = credits.filter(
    (credit) => credit.author !== leadCredit?.author,
  );

  // Illustrative Unsplash images need no credit; a self-hosted asset always does.
  if (!leadCredit && place.gallery[0]?.startsWith("/")) {
    console.error("Self-hosted lead image missing a credit", { place: place.id });
  }

  const moreHtml = place.gallery.length > 1 ? (
    <>
      <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-muted">
        More of {place.name}
      </p>
      <div className="mt-2 flex flex-wrap gap-3">
        {place.gallery.slice(1).map((photo) => {
          const credit = photoCredit(photo);
          return (
            <figure
              key={photo}
              className="min-w-[100px] flex-1 overflow-hidden rounded-2xl"
            >
              <img
                src={imageUrl(photo, 700)}
                alt={placeFallbackAlt(place.name, place.category, place.area, photo)}
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

  // Schema.org type per category: a club is a NightClub, a beach is a
  // TouristAttraction, a restaurant is a Restaurant. Google reads these.
  const PLACE_TYPES: Record<string, string> = {
    clubs: "NightClub",
    beaches: "TouristAttraction",
    eats: "Restaurant",
    play: "EntertainmentBusiness",
    culture: "TouristAttraction",
    landmarks: "TouristAttraction",
  };

  const placeJsonLd = {
    "@context": "https://schema.org",
    "@type": PLACE_TYPES[place.category] ?? "LocalBusiness",
    name: place.name,
    description: `${place.tagline}. ${place.note}`,
    url: `${SITE_URL}/places/${place.id}`,
    image: place.gallery.map((src) => imageUrl(src, 1200)),
    priceRange: place.price,
    ...(place.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: place.address,
            addressLocality: place.area,
            addressRegion: "Lagos",
            addressCountry: "NG",
          },
        }
      : {}),
  };

  // Which date this card can show, and what it stands for. "Listed" is not a
  // softer "verified": it says the row was read from a source, nothing more.
  const provenance = placeProvenance(place);

  return (
    <main className="bg-cream text-ink">
      <JsonLd data={placeJsonLd} />
      <div className="mx-auto max-w-6xl px-6 pt-8 sm:px-10">
        <nav className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted">
          <Link href="/" className="transition hover:text-ink">
            ← Èkó Season
          </Link>
          <Link href="/places" className="transition hover:text-ink">
            All places
          </Link>
        </nav>

        <p className="mt-10 text-[11px] uppercase tracking-[0.2em] text-muted">
          <Link href="/places" className="hover:text-ink">
            Where to go
          </Link>
          <span className="px-2">/</span>
          {category}
          <span className="px-2">/</span>
          {place.area}
        </p>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl leading-tight sm:text-5xl">
              {place.name}
            </h1>
            <p className="mt-2 text-sm text-muted">{place.tagline}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="inline-flex h-9 items-center rounded-full border border-ink/15 px-3 leading-none">
              {place.area}
            </span>
            <span className="inline-flex h-9 items-center rounded-full bg-ink px-3 leading-none text-cream">
              {place.price}
            </span>
            <span className="inline-flex h-9 items-center rounded-full border border-ink/15 px-3 leading-none">
              {category}
            </span>
            <ShortlistButton
              kind="place"
              id={place.id}
              name={place.name}
              variant="pill"
            />
          </div>
        </div>

        <figure className="mt-8 overflow-hidden rounded-3xl">
          <img
            src={imageUrl(place.gallery[0], 1800)}
            srcSet={imageSrcSet(place.gallery[0], [720, 1080, 1440, 1800])}
            sizes="(min-width: 1152px) 1080px, 100vw"
            alt={placeFallbackAlt(place.name, place.category, place.area, place.gallery[0])}
            decoding="async"
            className="aspect-[16/9] w-full object-cover"
          />
        </figure>
        {place.imageNote ? (
          <p className="mt-2 border-l-2 border-ember/40 pl-2 text-[10px] uppercase leading-relaxed tracking-[0.1em] text-ember/80">
            {place.imageNote}
          </p>
        ) : null}

        {moreHtml}

        <p className="mt-2 text-[11px] text-muted">
          {leadCredit
            ? `Photography: ${leadCredit.author} (${leadCredit.license}) — ${leadCredit.source ?? "Wikimedia Commons"}.${leadCredit.venue ? "" : " Illustrative — not the venue itself."}`
            : "Illustrative photography — not the venue itself."}
          {moreCredits.length > 0 &&
            " " + `More from ${leadCredit?.source ?? "Wikimedia Commons"}: ${moreCredits.map((c) => c.author + " (" + c.license + ")").join(", ")}.`}
        </p>

        <div className="mt-10 grid gap-10 border-t border-ink/10 pt-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h2 className="font-display text-2xl">Why go</h2>
            <p className="mt-3 text-base leading-relaxed text-ink/80">
              {place.note}
            </p>

            <h2 className="mt-10 font-display text-2xl">Practical notes</h2>
            <dl className="mt-4 divide-y divide-ink/10 text-sm">
              {[
                ["Address", place.address ?? `${place.area}, Lagos`],
                ["Area", place.area],
                ["What it costs", place.price],
                ["Type", category],
                ...(hasSourcedNights(place)
                  ? [["Regular nights", nightsLabel(place.nights) ?? ""]]
                  : []),
                [
                  provenance.verified ? "Verified" : "Listed",
                  provenance.verified
                    ? formatChecked(provenance.date)
                    : `${formatChecked(provenance.date)} · details not independently confirmed`,
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-6 py-3">
                  <dt className="text-muted">{label}</dt>
                  <dd className="text-right">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-muted">
              <Link
                href="/sources"
                className="underline decoration-ink/20 underline-offset-4 hover:text-ink"
              >
                What “listed” and “verified” mean
              </Link>
            </p>

            {place.nightsSource && place.nightsCheckedAt && (
              <p className="mt-3 text-[11px] leading-relaxed text-muted">
                Nights from{" "}
                <a
                  href={place.nightsSource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
                >
                  {place.nightsSource.label}
                </a>
                , read {formatChecked(place.nightsCheckedAt)}.
              </p>
            )}

            <p className="mt-4">
              <ReportLink
                page={`/places/${place.id}`}
                about="this place closed, moved, has the wrong price or a wrong night"
              />
            </p>
          </div>

          <aside className="relative h-fit overflow-hidden rounded-3xl bg-ink">
            <img
              src={imageUrl(place.gallery[1] ?? place.gallery[0], 1000)}
              alt={placeFallbackAlt(place.name, place.category, place.area, place.gallery[1] ?? place.gallery[0])}
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-78"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-ink via-ink/90 to-ink/60"
            />
            <div className="relative p-6 text-cream">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">
                Find it
              </p>
              <p className="mt-2 text-sm leading-relaxed">
                {place.address ?? `${place.name}, ${place.area}, Lagos`}
              </p>

              <a
                href={mapUrl(place)}
                target="_blank"
                rel="noreferrer"
                className="mt-5 flex items-center justify-between rounded-full bg-ink px-5 py-3 text-sm font-medium text-cream transition hover:bg-ember"
              >
                Open in Maps
                <span aria-hidden>↗</span>
              </a>

              <Link
                href="/#getting-around"
                className="mt-2 flex items-center justify-between rounded-full border border-white/30 px-5 py-3 text-sm transition hover:border-white/50"
              >
                How to get there
                <span aria-hidden>→</span>
              </Link>

              <p className="mt-4 text-[11px] leading-relaxed text-white/70">
                {leadCredit
                  ? `Photography: ${leadCredit.author} (${leadCredit.license}) — ${leadCredit.source ?? "Wikimedia Commons"}`
                  : "Illustrative photography — not the venue."}
              </p>
            </div>
          </aside>
        </div>

        {suggestions.length > 0 && (
          <section className="mt-16 border-t border-ink/10 pt-10">
            <h2 className="font-display text-2xl">Nearby</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {suggestions.map((item) => (
                <Link
                  key={item.id}
                  href={`/places/${item.id}`}
                  className="group overflow-hidden rounded-2xl bg-white/60"
                >
                  <img
                    src={imageUrl(item.gallery[0], 700)}
                    alt={placeFallbackAlt(item.name, item.category, item.area, item.gallery[0])}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  {(photoCredit(item.gallery[0])?.venue ?? false) && (
                    <p className="mt-2 text-[10px] text-muted">
                      Photo: {photoCredit(item.gallery[0])?.author}
                    </p>
                  )}
                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                      {item.area}
                    </p>
                    <p className="mt-1 font-display text-lg">{item.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="mt-auto pt-20">
        <SiteFooter />
      </div>
    </main>
  );
}
