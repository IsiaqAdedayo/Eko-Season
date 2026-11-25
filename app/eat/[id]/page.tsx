import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "../../../components/site-footer";
import { allDishes, type Dish } from "../../../lib/dishes";
import { getPlace, mapUrl } from "../../../lib/place";
import { imageUrl } from "../../../lib/media";

type Props = { params: Promise<{ id: string }> };

const getDish = (id: string) => allDishes.find((dish) => dish.id === id);

export function generateStaticParams() {
  return allDishes.map((dish) => ({ id: dish.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const dish = getDish(id);
  if (!dish) return { title: "Dish not found — Èkó Season" };

  const title = `${dish.name} — Èkó Season`;
  const description = `${dish.note} Where to eat it in Lagos, and how to cook it at home.`;
  const url = `/eat/${dish.id}`;
  const image = imageUrl(dish.image, 1200, 630);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: "Èkó Season",
      images: [{ url: image, alt: dish.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

function RelatedCard({ dish }: { dish: Dish }) {
  return (
    <Link
      href={`/eat/${dish.id}`}
      className="group overflow-hidden rounded-2xl bg-white/60 transition hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgba(23,16,11,0.4)]"
    >
      <img
        src={dish.image}
        alt={dish.imageAlt}
        loading="lazy"
        className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
      />
      <div className="p-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
          {dish.kind === "snack" ? "Snack" : "Plate"}
        </p>
        <p className="mt-1 line-clamp-1 font-display text-lg leading-tight transition group-hover:text-ember">
          {dish.name}
        </p>
      </div>
    </Link>
  );
}

export default async function DishPage({ params }: Props) {
  const { id } = await params;
  const dish = getDish(id);
  if (!dish) notFound();

  const place =
    dish.kind === "plate" && dish.place ? getPlace(dish.place) : undefined;
  const permitted = dish.imageCredit.license === "Used with permission";
  const related = allDishes
    .filter((item) => item.kind === dish.kind && item.id !== dish.id)
    .slice(0, 3);

  return (
    <main className="bg-cream text-ink">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-8 sm:px-10">
        <nav className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted">
          <Link href="/" className="transition hover:text-ink">
            ← Èkó Season
          </Link>
          <Link href="/#eat" className="transition hover:text-ink">
            What to eat
          </Link>
        </nav>

        <p className="mt-10 text-[11px] uppercase tracking-[0.2em] text-muted">
          <Link href="/#eat" className="hover:text-ink">
            What to eat
          </Link>
          <span className="px-2">/</span>
          {dish.kind === "snack" ? "Snacks" : "Plates"}
          <span className="px-2">/</span>
          {dish.name}
        </p>

        <header className="mt-4 max-w-3xl">
          <h1 className="font-display text-4xl leading-tight sm:text-6xl">
            {dish.name}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink/75 sm:text-lg">
            {dish.note}
          </p>
        </header>

        <figure className="mt-8 overflow-hidden rounded-3xl">
          <img
            src={dish.image}
            alt={dish.imageAlt}
            className="aspect-[16/9] w-full object-cover"
          />
        </figure>

        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          {permitted ? (
            <>
              Recipe &amp; photo:{" "}
              <a
                href={dish.imageCredit.page}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-ink/25 underline-offset-4 hover:text-ink hover:decoration-ink"
              >
                {dish.imageCredit.author}
              </a>{" "}
              — used with permission.
            </>
          ) : (
            <>
              Photo:{" "}
              <a
                href={dish.imageCredit.page}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-ink/25 underline-offset-4 hover:text-ink hover:decoration-ink"
              >
                {dish.imageCredit.author}
              </a>{" "}
              ({dish.imageCredit.license}) — Wikimedia Commons.
            </>
          )}
        </p>

        <div className="mt-10 grid gap-10 border-t border-ink/10 pt-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h2 className="font-display text-2xl">
              {dish.kind === "snack" ? "The snack" : "The plate"}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink/80">
              {dish.about}
            </p>

            <h2 className="mt-10 font-display text-2xl">How it is eaten</h2>
            <p className="mt-3 text-base leading-relaxed text-ink/80">
              {dish.eatWith}
            </p>

          </div>

          <aside className="h-fit space-y-4">
            <div className="rounded-3xl bg-white/70 p-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-ember">
                {dish.kind === "snack" ? "Where to find it" : "Where to eat it"}
              </p>

              {place ? (
                <>
                  <p className="mt-3 font-display text-2xl leading-tight">
                    {place.name}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {place.area} · {place.price}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70">
                    {place.tagline}
                  </p>
                  <Link
                    href={`/places/${place.id}`}
                    className="mt-5 flex items-center justify-between rounded-full bg-ink px-5 py-3 text-sm font-medium text-cream transition hover:bg-ember"
                  >
                    See the venue
                    <span aria-hidden>→</span>
                  </Link>
                  <a
                    href={mapUrl(place)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 flex items-center justify-between rounded-full border border-ink/20 px-5 py-3 text-sm transition hover:border-ink/50"
                  >
                    Open in Maps
                    <span aria-hidden>↗</span>
                  </a>
                </>
              ) : (
                <>
                  <p className="mt-3 text-sm leading-relaxed text-ink/80">
                    {dish.kind === "snack" ? dish.where : "Across Lagos."}
                  </p>
                  <Link
                    href="/places?category=eats"
                    className="mt-5 flex items-center justify-between rounded-full bg-ink px-5 py-3 text-sm font-medium text-cream transition hover:bg-ember"
                  >
                    Places to eat
                    <span aria-hidden>→</span>
                  </Link>
                </>
              )}
            </div>

            <div className="rounded-3xl border border-ink/10 p-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-ember">
                Cook it yourself
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">
                Recipe from {dish.recipe.label}.
              </p>
              <a
                href={dish.recipe.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center justify-between rounded-full border border-ink/20 px-5 py-3 text-sm transition hover:border-ink/50"
              >
                Open the recipe
                <span aria-hidden>↗</span>
              </a>
            </div>
          </aside>
        </div>

        <section className="mt-16 border-t border-ink/10 pt-10">
          <h2 className="font-display text-2xl">
            More {dish.kind === "snack" ? "snacks" : "plates"}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {related.map((item) => (
              <RelatedCard key={item.id} dish={item} />
            ))}
          </div>
        </section>
      </div>

      <div className="mt-auto pt-16">
        <SiteFooter />
      </div>
    </main>
  );
}
