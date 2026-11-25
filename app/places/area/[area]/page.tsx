import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "../../../../components/site-footer";
import { ShortlistButton } from "../../../../components/shortlist";
import { PlaceCard } from "../../../../components/place-card";
import { AreaMap } from "../../../../components/area-map";
import {
  imageUrl,
  photoCredit,
  placeFallbackAlt,
} from "../../../../lib/media";
import placesRaw from "../../../../data/places.json" with { type: "json" };
import dishesRaw from "../../../../data/dishes.json" with { type: "json" };
import { corridorById, type CorridorId, CATEGORY_LABELS, matchesArea } from "../../../../lib/areas";
import { getPlace, type Place } from "../../../../lib/place";
import { areaCopy } from "../../../../data/areas";
import { formatChecked, SOCIAL_IMAGE } from "../../../../lib/site";

const places = placesRaw as Place[];
const dishes = dishesRaw as Array<{
  id: string;
  place: string | null;
  name: string;
  image: string | null;
  imageAlt: string | null;
  kind: string;
  note: string | null;
}>;

type Props = { params: Promise<{ area: string }> };

export function generateStaticParams() {
  return ["lekki", "lagos-island", "mainland"].map((area) => ({ area }));
}

function placesInCorridor(corridorId: CorridorId): Place[] {
  const areaLabel =
    corridorId === "lekki"
      ? "Lekki"
      : corridorId === "lagos-island"
        ? "Lagos Island"
        : "Mainland";
  return places.filter((p) => matchesArea(p, areaLabel)).sort((a, b) => a.area.localeCompare(b.area));
}

function categoryCounts(places: Place[]) {
  const raw: Record<string, number> = {};
  for (const p of places) {
    raw[p.category] = (raw[p.category] ?? 0) + 1;
  }
  const out: Record<string, { label: string; count: number }> = {};
  for (const [category, count] of Object.entries(raw)) {
    out[category] = { label: CATEGORY_LABELS[category] ?? category, count };
  }
  return out;
}

function dishList(corridorId: CorridorId) {
  const corridorPlaceIds = new Set(placesInCorridor(corridorId).map((p) => p.id));
  const filtered = dishes.filter((d) => d.place && corridorPlaceIds.has(d.place));
  if (filtered.length === 0) return null;

  return (
    <section className="mt-14">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 className="font-display text-2xl">What to eat here</h2>
        <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
          {filtered.length} dish{filtered.length === 1 ? "" : "es"} tied to a place in this corridor
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {filtered.map((dish) => {
          const venue = getPlace(dish.place!);
          return (
            <Link
              key={dish.id}
              href={`/eat/${dish.id}`}
              className="group flex items-start gap-4 rounded-2xl border border-ink/10 bg-white/60 p-4 transition hover:border-ink/25 hover:bg-white"
            >
              <img
                src={imageUrl(dish.image ?? "", 200)}
                alt={dish.imageAlt ?? ""}
                loading="lazy"
                className="h-20 w-20 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                  {dish.kind === "plate" ? "Plate" : "Snack"} · {venue?.name}
                </p>
                <p className="mt-0.5 font-display text-lg leading-tight group-hover:text-gold transition">
                  {dish.name}
                </p>
                <p className="mt-1 text-xs text-muted line-clamp-2">{dish.note ?? ""}</p>
                <p className="mt-2 text-[11px] text-gold">
                  Read about it →
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="mt-4 text-[11px] text-muted">
        The snacks without a listed place — puff-puff, akara, meat pie, egg roll, buns,
        chin chin, moi moi, okpa — are sold everywhere in this corridor as well. Look for
        the queues at road junctions and school gates in the mornings, and the roadside
        fryers after dark.
      </p>
    </section>
  );
}

function landmarksSection(landmarks: Place[]) {
  if (landmarks.length === 0) return null;

  return (
    <section className="mt-14">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 className="font-display text-2xl">City sights in this corridor</h2>
        <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
          {landmarks.length} landmark{landmarks.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {landmarks.map((place) => {
          const credit = photoCredit(place.gallery[0]);
          return (
            <Link
              key={place.id}
              href={`/places/${place.id}`}
              className="group overflow-hidden rounded-2xl bg-white/60"
            >
              <img
                src={imageUrl(place.gallery[0], 700)}
                alt={placeFallbackAlt(place.name, place.category, place.area, place.gallery[0])}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              {credit?.venue && (
                <p className="-mt-2 text-[10px] text-muted">Photo: {credit.author}</p>
              )}
              <div className="p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{place.area}</p>
                <p className="mt-1 font-display text-lg leading-tight group-hover:text-gold transition">
                  {place.name}
                </p>
                <p className="mt-1 text-xs text-ink/75 line-clamp-2">{place.note}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function priceMixTable(places: Place[]) {
  const counts: Record<string, number> = {};
  for (const p of places) {
    const tier =
      p.price.startsWith("₦₦₦₦") || p.price.includes("₦₦₦₦")
        ? "₦₦₦₦"
        : p.price.startsWith("₦₦₦")
          ? "₦₦₦"
          : p.price.startsWith("₦₦")
            ? "₦₦"
            : p.price.startsWith("₦")
              ? "₦"
              : "other";
    counts[tier] = (counts[tier] ?? 0) + 1;
  }
  const total = places.length;
  const rows = [
    { tier: "₦", label: "Cheap" },
    { tier: "₦₦", label: "Moderate" },
    { tier: "₦₦₦", label: "Pricey" },
    { tier: "₦₦₦₦", label: "Splurge" },
    { tier: "other", label: "Other" },
  ];

  const max = Math.max(1, ...Object.values(counts));

  return (
    <div className="mt-14 rounded-2xl border border-ink/10 bg-cream/70 p-5">
      <p className="text-[11px] uppercase tracking-[0.2em] text-ember font-medium">
        Price mix — {total} places
      </p>
      <p className="mt-1 text-xs text-muted">
        A rough sense of what this corridor costs. Free and paid-entry venues are counted
        under "Other".
      </p>

      <div className="mt-5 space-y-2">
        {rows.map(({ tier, label }) => {
          const count = counts[tier] ?? 0;
          const bar = (count / max) * 100;
          return (
            <div key={tier} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-[11px] text-muted">{label}</span>
              <div className="flex-1 h-5 overflow-hidden rounded-full bg-ink/5">
                <div
                  className="h-full rounded-full bg-ink/20 transition-all duration-500"
                  style={{ width: `${bar}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-[11px] tabular-nums text-ink">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area } = await params;
  const corridor = corridorById(area);
  if (!corridor) return { title: "Area not found — Èkó Season" };

  const areaId = area as CorridorId;
  const copy = areaCopy[areaId] as { title: string; lead: string };
  const corridorPlaces = placesInCorridor(areaId);
  const leadImage =
    corridorPlaces.find((p) => photoCredit(p.gallery[0])?.venue)?.gallery[0] ??
    corridorPlaces[0]?.gallery[0] ??
    SOCIAL_IMAGE;

  return {
    title: `${copy.title} — Èkó Season`,
    description: `${copy.lead} ${corridorPlaces.length} places in the guide.`,
    alternates: { canonical: `/places/area/${areaId}` },
    openGraph: {
      type: "website",
      siteName: "Èkó Season",
      url: `/places/area/${areaId}`,
      title: copy.title,
      description: copy.lead,
      images: [
        {
          url: imageUrl(leadImage, 1200, 630),
          width: 1200,
          height: 630,
          alt: copy.title,
        },
      ],
    },
  };
}

export default async function AreaPage({ params }: Props) {
  const { area } = await params;
  const corridor = corridorById(area);
  if (!corridor) notFound();

  const areaId = area as CorridorId;
  const copy = areaCopy[areaId] as {
    title: string;
    lead: string;
    whatYouWillFind: string;
    suggestedDay: { morning: string; afternoon: string; evening: string };
  };
  const corridorPlaces = placesInCorridor(areaId);
  const counts = categoryCounts(corridorPlaces);
  const landmarks = corridorPlaces.filter((p) => p.category === "landmarks");

  const grouped: { category: string; label: string; count: number; places: Place[] }[] =
    Object.entries(counts)
      .filter(([, v]) => v.count > 0)
      .map(([category, { label, count }]) => ({
        category,
        label,
        count,
        places: corridorPlaces.filter((p) => p.category === category),
      }));

  const leadImage =
    corridorPlaces.find((p) => photoCredit(p.gallery[0])?.venue)?.gallery[0] ??
    corridorPlaces[0]?.gallery[0] ??
    SOCIAL_IMAGE;
  const leadCredit = photoCredit(leadImage);

  return (
    <main className="bg-cream text-ink">
      <div className="mx-auto max-w-7xl px-6 pt-8 sm:px-10">
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
          Day guides
          <span className="px-2">/</span>
          {copy.title}
        </p>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl leading-tight sm:text-5xl">
              {copy.title}
            </h1>
            <p className="mt-2 text-sm text-muted">{corridor.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="inline-flex h-9 items-center rounded-full bg-ink px-3 leading-none text-cream">
              {corridorPlaces.length} places
            </span>
            <ShortlistButton
              kind="place"
              id={areaId}
              name={corridor.label}
              variant="pill"
            />
          </div>
        </div>

        <figure className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-3xl">
          <img
            src={imageUrl(leadImage, 1800)}
            alt={placeFallbackAlt(corridor.title, "area", corridor.label, leadImage)}
            className="aspect-[16/9] w-full object-cover"
          />
        </figure>

        {leadCredit && (
          <p className="mt-2 text-center text-[11px] text-muted">
            {leadCredit.venue
              ? `Photography: ${leadCredit.author} (${leadCredit.license}) — ${leadCredit.source ?? "Wikimedia Commons"}.`
              : "Illustrative photography — not this corridor itself."}
          </p>
        )}

        <div className="mx-auto mt-10 max-w-3xl">
          <AreaMap corridorId={areaId} />
        </div>

        <div className="mt-10 grid gap-10 border-t border-ink/10 pt-10 sm:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-display text-2xl">How to get there</h2>
            <p className="mt-3 text-base leading-relaxed text-ink/80">
              {corridor.arrive}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">
              The full fare and mode breakdown is on the{" "}
              <Link
                href="/#getting-around"
                className="underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
              >
                Getting around
              </Link>{" "}
              page.
            </p>
          </div>

          <aside className="relative h-fit overflow-hidden rounded-3xl bg-ink">
            <img
              src={imageUrl(
                corridorPlaces.find((p) => p.nights.length > 0)?.gallery[1] ??
                  corridorPlaces[0]?.gallery[1] ??
                  corridorPlaces[0]?.gallery[0] ??
                  leadImage,
                1000,
              )}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-78"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/90 to-ink/60" />
            <div className="relative p-6 text-cream">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">
                This corridor is known for
              </p>
              <p className="mt-2 text-sm leading-relaxed">
                {copy.whatYouWillFind}
              </p>
              <Link
                href="/#getting-around"
                className="mt-5 flex items-center justify-between rounded-full border border-white/30 px-5 py-3 text-sm transition hover:border-white/50"
              >
                Getting around
                <span aria-hidden>→</span>
              </Link>
            </div>
          </aside>
        </div>

        <section className="mt-14 rounded-2xl border border-ink/10 bg-white/60 p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-ember font-medium">
            A simple day here
          </p>
          <p className="mt-1 text-sm text-muted">
            One possible shape for a day — swap the order for weather, traffic and what
            your group actually wants to do.
          </p>

          <dl className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <dt className="text-[11px] uppercase tracking-[0.2em] text-ember font-medium">
                Morning
              </dt>
              <dd className="text-sm text-ink/80">{copy.suggestedDay.morning}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-[11px] uppercase tracking-[0.2em] text-ember font-medium">
                Afternoon
              </dt>
              <dd className="text-sm text-ink/80">{copy.suggestedDay.afternoon}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-[11px] uppercase tracking-[0.2em] text-ember font-medium">
                Evening
              </dt>
              <dd className="text-sm text-ink/80">{copy.suggestedDay.evening}</dd>
            </div>
          </dl>
        </section>

        {priceMixTable(corridorPlaces)}

        {grouped.map((block) => (
          <section key={block.category} className="mt-14">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
              <h2 className="font-display text-2xl">{block.label}</h2>
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
                {block.places.length} {block.places.length === 1 ? "place" : "places"}
              </span>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {block.places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </section>
        ))}

        {dishList(areaId)}

        {landmarksSection(landmarks)}
      </div>

      <div className="mt-auto pt-20">
        <SiteFooter />
      </div>
    </main>
  );
}
