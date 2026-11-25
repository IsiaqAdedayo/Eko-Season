"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { sections } from "../data/sections";
import { FILTER_EVENT, type PlaceFilter } from "../lib/filters";
import { allPlaces, filterPlaces } from "../lib/place";
import { PlaceCard } from "./place-card";
import { PlaceFilters } from "./place-filters";

/** The home grid is a digest: eight cards, filters still applied in full. */
const HOME_LIMIT = 8;

export function PlacesSection() {
  const [category, setCategory] = useState("all");
  const [area, setArea] = useState("Anywhere");

  // The hero's plan bar filters this grid without navigating.
  useEffect(() => {
    const onFilter = (event: Event) => {
      const detail = (event as CustomEvent<PlaceFilter>).detail;
      setCategory(detail.category || "all");
      setArea(detail.area || "Anywhere");
    };
    window.addEventListener(FILTER_EVENT, onFilter);
    return () => window.removeEventListener(FILTER_EVENT, onFilter);
  }, []);

  const visible = useMemo(() => filterPlaces(category, area), [category, area]);

  const shown = visible.slice(0, HOME_LIMIT);

  // Filters carry over to the full list, so "see all" never loses the choice.
  const fullListHref = (() => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (area !== "Anywhere") params.set("area", area);
    const query = params.toString();
    return `/places${query ? `?${query}` : ""}`;
  })();

  return (
    <section id="places" className="bg-cream px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ember">
              {sections.places.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              {sections.places.title}
            </h2>
          </div>
          <div className="max-w-sm">
            <p className="text-sm leading-relaxed text-muted">
              {visible.length} spots across the island and the mainland,
              filtered for what you actually want to do tonight.
            </p>
            <Link
              href={fullListHref}
              className="mt-2 inline-block text-xs text-ember underline-offset-4 hover:underline"
            >
              {visible.length < allPlaces.length
                ? `See all ${visible.length} in the full list →`
                : `See all ${allPlaces.length} places →`}
            </Link>
          </div>
        </div>

        <PlaceFilters
          category={category}
          area={area}
          onCategory={setCategory}
          onArea={setArea}
          showAreas={false}
        />

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>

        {visible.length > shown.length && (
          <p className="mt-8 text-sm text-muted">
            Showing {shown.length} of {visible.length}.{" "}
            <Link
              href={fullListHref}
              className="text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
            >
              The other {visible.length - shown.length} are in the full list
            </Link>
            .
          </p>
        )}

        {visible.length === 0 && (
          <p className="mt-10 rounded-2xl border border-dashed border-ink/20 p-10 text-center text-sm text-muted">
            Nothing in that corner of the city yet. Try another area.
          </p>
        )}
      </div>
    </section>
  );
}
