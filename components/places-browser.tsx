"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AREA_OPTIONS,
  CATEGORY_TABS,
  allPlaces,
  filterPlaces,
  type Place,
} from "../lib/place";
import { Pagination } from "./pagination";
import { PlaceCard } from "./place-card";
import { PlaceFilters } from "./place-filters";

/** Fixed page size, so a filtered list still lands on a predictable page. */
const PAGE_SIZE = 12;

type Props = {
  places?: Place[];
  initialCategory?: string;
  initialArea?: string;
  initialPage?: number;
};

/**
 * Category and area filters over the full list. Filter state is mirrored into
 * the query string — pushed, not replaced, so back restores a filtered view.
 */
export function PlacesBrowser({
  places = allPlaces,
  initialCategory = "all",
  initialArea = "Anywhere",
  initialPage = 1,
}: Props) {
  const [category, setCategory] = useState(initialCategory);
  const [area, setArea] = useState(initialArea);
  const [page, setPage] = useState(initialPage);

  const visible = useMemo(
    () => filterPlaces(category, area, places),
    [places, category, area],
  );

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  // Filters can shrink the list under the current page; clamp instead of
  // showing an empty grid.
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE_SIZE;
  const shown = visible.slice(start, start + PAGE_SIZE);

  function writeUrl(
    nextCategory: string,
    nextArea: string,
    nextPage: number,
  ) {
    const params = new URLSearchParams();
    if (nextCategory !== "all") params.set("category", nextCategory);
    if (nextArea !== "Anywhere") params.set("area", nextArea);
    if (nextPage > 1) params.set("page", String(nextPage));
    const query = params.toString();
    const next = `/places${query ? `?${query}` : ""}`;

    // A no-op click shouldn't add a history entry that looks identical.
    if (`${window.location.pathname}${window.location.search}` === next) return;

    // Push, not replace: each filter is a view worth going back to.
    window.history.pushState(null, "", next);
  }

  // Back and forward move the URL without re-rendering this component, so read
  // the query string back into state whenever the history entry changes.
  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const nextCategory = params.get("category") ?? "all";
      const nextArea = params.get("area") ?? "Anywhere";
      const nextPage = Number.parseInt(params.get("page") ?? "1", 10) || 1;

      setCategory(
        CATEGORY_TABS.some((tab) => tab.value === nextCategory)
          ? nextCategory
          : "all",
      );
      setArea(AREA_OPTIONS.includes(nextArea) ? nextArea : "Anywhere");
      setPage(Math.max(nextPage, 1));
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function update(nextCategory: string, nextArea: string) {
    setCategory(nextCategory);
    setArea(nextArea);
    // A new filter means a new result set: start it from the top.
    setPage(1);
    writeUrl(nextCategory, nextArea, 1);
  }

  function goToPage(nextPage: number) {
    setPage(nextPage);
    writeUrl(category, area, nextPage);
  }

  return (
    <div>
      <PlaceFilters
        category={category}
        area={area}
        onCategory={(next) => update(next, area)}
        onArea={(next) => update(category, next)}
      />

      <p className="mt-6 text-xs text-muted">
        {visible.length} of {places.length} places
        {area !== "Anywhere" ? ` in ${area}` : ""}
        {category !== "all"
          ? ` · ${CATEGORY_TABS.find((tab) => tab.value === category)?.label}`
          : ""}
        {pageCount > 1 ? ` · showing ${start + 1}–${start + shown.length}` : ""}
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>

      <Pagination page={current} pageCount={pageCount} onPage={goToPage} />

      {visible.length === 0 && (
        <p className="mt-8 rounded-2xl border border-dashed border-ink/20 p-10 text-center text-sm text-muted">
          Nothing in that corner of the city yet. Try another area.
        </p>
      )}
    </div>
  );
}
