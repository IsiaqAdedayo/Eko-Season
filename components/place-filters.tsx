"use client";

import { AREA_OPTIONS, CATEGORY_TABS } from "../lib/place";

type Props = {
  category: string;
  area: string;
  onCategory: (category: string) => void;
  onArea: (area: string) => void;
  /** The home page lets the hero pick the area, so it hides the area row. */
  showAreas?: boolean;
};

/**
 * The category and area chips, used by the home grid and the /places browser.
 * One implementation so the two lists can't disagree about what a filter
 * looks like or which one is active.
 */
export function PlaceFilters({
  category,
  area,
  onCategory,
  onArea,
  showAreas = true,
}: Props) {
  return (
    <>
      <div
        role="group"
        aria-label="Filter by category"
        className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1"
      >
        {CATEGORY_TABS.map((item) => {
          const selected = category === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onCategory(item.value)}
              aria-pressed={selected}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs transition ${
                selected
                  ? "border-ink bg-ink font-medium text-cream"
                  : "border-ink/15 text-ink/70 hover:border-ink/40"
              }`}
            >
              {selected && (
                <span aria-hidden className="mr-1">
                  ✓
                </span>
              )}
              {item.label}
            </button>
          );
        })}

        {area !== "Anywhere" && (
          <button
            type="button"
            onClick={() => onArea("Anywhere")}
            aria-label={`Remove ${area} filter`}
            className="shrink-0 rounded-full border border-ember/40 bg-ember/10 px-4 py-2 text-xs text-ember"
          >
            {area} <span aria-hidden>×</span>
          </button>
        )}
      </div>

      {showAreas && (
        <div
          role="group"
          aria-label="Filter by area"
          className="no-scrollbar mt-2 flex items-center gap-2 overflow-x-auto pb-1 text-xs"
        >
          <span
            aria-hidden
            className="shrink-0 pr-1 uppercase tracking-[0.2em] text-muted"
          >
            Where
          </span>
          {AREA_OPTIONS.map((option) => {
            const selected = area === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => onArea(option)}
                aria-pressed={selected}
                className={`shrink-0 rounded-full px-3 py-1.5 transition ${
                  selected
                    ? "bg-sand font-medium text-ink"
                    : "text-ink/60 hover:text-ink"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
