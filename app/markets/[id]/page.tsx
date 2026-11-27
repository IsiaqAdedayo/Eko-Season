import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "../../../components/site-footer";
import { markets } from "../../../data/activities";
import { getMarketDetail } from "../../../data/marketDetails";
import { imageUrl } from "../../../lib/media";
import { mapsSearch } from "../../../lib/place";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return markets.map((market) => ({ id: market.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const market = markets.find((item) => item.id === id);
  const detail = getMarketDetail(id);
  if (!market || !detail) return { title: "Market not found — Èkó Season" };

  const url = `/markets/${market.id}`;
  const description = `${market.knownFor} in ${market.area}. ${detail.intro}`;
  return {
    title: `${market.name}, ${market.area} — what to buy | Èkó Season`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: `${market.name}, ${market.area}`,
      description,
      url,
      siteName: "Èkó Season",
    },
  };
}

export default async function MarketPage({ params }: Props) {
  const { id } = await params;
  const market = markets.find((item) => item.id === id);
  const detail = getMarketDetail(id);
  if (!market || !detail) notFound();

  return (
    <main className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-3xl px-6 pt-8 pb-20 sm:px-10">
        <nav className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted">
          <Link href="/activities#markets" className="transition hover:text-ink">
            ← The markets worth the trip
          </Link>
          <Link href="/activities#markets" className="transition hover:text-ink">
            All markets
          </Link>
        </nav>

        <header className="mt-8">
          <p className="text-xs uppercase tracking-[0.3em] text-ember">{market.area}</p>
          <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">{market.name}</h1>
          <p className="mt-2 text-sm text-ink/70">{market.knownFor}</p>
        </header>

        <figure className="mt-6">
          <img
            src={imageUrl(market.image, 1400)}
            alt={market.imageAlt}
            className="aspect-[3/2] w-full rounded-3xl object-cover"
          />
          {market.imageNote ? (
            <p className="mt-2 border-l-2 border-ember/40 pl-2 text-[10px] uppercase leading-relaxed tracking-[0.1em] text-ember/80">
              {market.imageNote}
            </p>
          ) : null}
          <figcaption className="mt-2 text-[10px] leading-relaxed text-muted">
            Photo:{" "}
            <a
              href={market.imagePage}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-ink/20 underline-offset-2 hover:decoration-ink/50"
            >
              {market.imageCredit}
            </a>
          </figcaption>
        </figure>

        <p className="mt-6 text-sm leading-relaxed text-ink/80">{detail.intro}</p>

        <section className="mt-10">
          <div className="flex items-baseline justify-between border-b border-ink/20 pb-2">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-muted">What you can buy</h2>
            <span className="text-[10px] uppercase tracking-[0.14em] text-ember">
              {detail.sells.length} things
            </span>
          </div>
          <ul className="mt-4 space-y-3">
            {detail.sells.map((entry) => (
              <li key={entry.item} className="rounded-xl border border-ink/10 bg-white/50 p-4">
                <p className="text-sm font-medium">{entry.item}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{entry.note}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="border-b border-ink/20 pb-2 text-[11px] uppercase tracking-[0.2em] text-muted">
            Before you go
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink/80">
            {detail.advice.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ember" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
        </section>

        {detail.gallery.length > 0 ? (
          <section className="mt-10">
            <h2 className="border-b border-ink/20 pb-2 text-[11px] uppercase tracking-[0.2em] text-muted">
              More of {market.name}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {detail.gallery.map((photo) => (
                <figure key={photo.src} className="m-0 overflow-hidden rounded-2xl">
                  <img
                    src={imageUrl(photo.src, 900)}
                    alt={photo.alt}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <figcaption className="mt-2 text-[10px] leading-relaxed text-muted">
                    Photo:{" "}
                    <a
                      href={photo.page}
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-ink/20 underline-offset-2 hover:decoration-ink/50"
                    >
                      {photo.credit}
                    </a>
                  </figcaption>
                  {photo.note ? (
                    <p className="mt-1 border-l-2 border-ember/40 pl-2 text-[10px] uppercase leading-relaxed tracking-[0.1em] text-ember/80">
                      {photo.note}
                    </p>
                  ) : null}
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-10 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="border-b border-ink/20 pb-2 text-[11px] uppercase tracking-[0.2em] text-muted">
              Best time
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/80">{market.bestTime}</p>
          </div>
          <div>
            <h2 className="border-b border-ink/20 pb-2 text-[11px] uppercase tracking-[0.2em] text-muted">
              Getting there
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/80">{detail.gettingThere}</p>
            <a
              href={mapsSearch(`${market.name}, ${market.area}, Lagos`)}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-[11px] text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
            >
              Directions →
            </a>
          </div>
        </section>

        <div className="mt-12 border-t border-ink/10 pt-6 text-[11px] leading-relaxed text-muted">
          Prices are a starting point and haggling is expected. Everything here was read on 26
          November 2026 —{" "}
          <Link
            href="/activities#markets"
            className="text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
          >
            see the other markets
          </Link>
          .
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
