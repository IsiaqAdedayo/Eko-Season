import Link from "next/link";
import { sections } from "../data/sections";
import { allPlaces, type Place } from "../lib/place";
import { PlaceCard } from "./place-card";

/**
 * Six tables, chosen for spread rather than rank.
 *
 * One per budget band, from the cheapest plate in the guide to the most
 * expensive, and no two doing the same job: a mainland buka, a late-night suya
 * counter, a garden room, dinner with theatre, and the tasting menu. Each pick
 * is here because its own note supports the reason, so this strip never claims
 * more than the place's card already does.
 */
const PICKS = [
  "ofada-boy", // ₦     Surulere — the budget end: ofada and ayamase
  "bukka-hut-yaba", // ₦₦    Yaba — amala without the guesswork
  "norma", // ₦₦    Lekki — the 2am suya queue
  "nok-by-alara", // ₦₦₦   Ikoyi — a garden room for a proper dinner
  "terra-kulture", // ₦₦₦   Victoria Island — Nigerian food plus theatre
  "the-ona", // ₦₦₦₦  Victoria Island — the seven-course splurge
];

export function EatSection() {
  const byId = new Map(allPlaces.map((place) => [place.id, place]));
  const picks = PICKS.map((id) => byId.get(id)).filter(
    (place): place is Place => Boolean(place),
  );
  if (picks.length === 0) return null;

  const eatsCount = allPlaces.filter(
    (place) => place.category === "eats",
  ).length;

  return (
    <section id="restaurants" className="bg-cream px-6 pb-20 sm:px-10 sm:pb-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ember">
              {sections.eat.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              {sections.eat.title}
            </h2>
          </div>
          <div className="max-w-sm">
            <p className="text-sm leading-relaxed text-muted">
              Our picks, not a ranking: six tables spread across the price bands
              and both sides of the water. Prices are the bands the guide
              records — confirm the rest with the restaurant.
            </p>
            <Link
              href="/places?category=eats"
              className="mt-2 inline-block text-xs text-ember underline-offset-4 hover:underline"
            >
              All {eatsCount} places to eat →
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {picks.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      </div>
    </section>
  );
}
