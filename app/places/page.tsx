import type { Metadata } from "next";
import Link from "next/link";
import { PlacesBrowser } from "../../components/places-browser";
import { SiteFooter } from "../../components/site-footer";
import { AREA_OPTIONS, CATEGORY_TABS, allPlaces } from "../../lib/place";
import { SOCIAL_IMAGE } from "../../lib/site";
import { imageUrl } from "../../lib/media";

type PageProps = {
  searchParams: Promise<{ category?: string; area?: string; page?: string }>;
};

export const metadata: Metadata = {
  title: `All ${allPlaces.length} places — Èkó Season`,
  description:
    "Every club, beach, table, landmark and cinema in the Detty December guide, filtered by category and area.",
  alternates: { canonical: "/places" },
  openGraph: {
    title: `All ${allPlaces.length} places`,
    description:
              "Clubs, beaches, restaurants, landmarks and things to do in Lagos this December.",
    url: "/places",
    type: "website",
    siteName: "Èkó Season",
    images: [
      {
        url: imageUrl(allPlaces[0]?.gallery[0] ?? SOCIAL_IMAGE, 1200, 630),
        width: 1200,
        height: 630,
        alt: `${allPlaces.length} Lagos places in the Èkó Season guide`,
      },
    ],
  },
};

export default async function PlacesPage({ searchParams }: PageProps) {
  const { category, area, page } = await searchParams;

  // Only accept values the filters understand, so a stray query string is harmless.
  const initialCategory = CATEGORY_TABS.some((tab) => tab.value === category)
    ? (category as string)
    : "all";
  const initialArea = AREA_OPTIONS.includes(area ?? "")
    ? (area as string)
    : "Anywhere";

  const initialPage = Math.max(Number.parseInt(page ?? "1", 10) || 1, 1);

  return (
    <main className="bg-cream text-ink">
      <div className="mx-auto max-w-7xl px-6 pt-8 sm:px-10">
        <nav className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted">
          <Link href="/" className="transition hover:text-ink">
            ← Èkó Season
          </Link>
          <Link href="/shows" className="transition hover:text-ink">
            Big shows
          </Link>
          <Link href="/places/area/lekki" className="transition hover:text-ink">
            Lekki
          </Link>
          <Link href="/places/area/lagos-island" className="transition hover:text-ink">
            Lagos Island
          </Link>
          <Link href="/places/area/mainland" className="transition hover:text-ink">
            Mainland
          </Link>
        </nav>

        <header className="mt-10 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-ember">
            Where to go
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            Every place in the guide
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {allPlaces.length} venues, from three-storey clubs on the Island to
            amala in Yaba, a cinema in Ikeja and a beach you can only reach by
            boat. Filter by what you want and where you&rsquo;re staying.
          </p>
        </header>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-20 pt-2 sm:px-10 sm:pb-28">
        <PlacesBrowser
          initialCategory={initialCategory}
          initialArea={initialArea}
          initialPage={initialPage}
        />
      </div>

      <div className="mt-auto pt-16">
        <SiteFooter />
      </div>
    </main>
  );
}
