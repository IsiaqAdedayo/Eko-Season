import { allPlaces, type Place } from "./place";
import type { TonightWeatherSignal } from "./weather";

/**
 * Weather contingency for the /tonight plan.
 *
 * The signal from lib/weather is deliberately blunt (rain-likely, heat-likely),
 * so the fallback is too: swap outdoor plans for covered ones. Nothing here is
 * a venue guarantee — the suggestions come from the guide's own categories.
 */

export type Contingency = {
  cue: "rain" | "heat";
  title: string;
  body: string;
};

const INDOOR = new Set(["eats", "culture", "play"]);

/** One shortlist shared by both cues: three is enough to offer, not a search result. */
export const indoorPlaces: Place[] = allPlaces
  .filter((place) => INDOOR.has(place.category))
  .slice(0, 3);

export function weatherContingency(
  signal: TonightWeatherSignal,
): Contingency[] {
  if (!signal.available) return [];

  const rows: Contingency[] = [];

  if (signal.rainCue) {
    const { kind, pop, dayLabel } = signal.rainCue;
    rows.push({
      cue: "rain",
      title: kind === "likely" ? "Rain plan" : "Rain watch",
      body: `${kind === "likely" ? "Rain is likely" : "Rain is possible"} ${dayLabel} (about ${Math.round(
        pop,
      )}%). Keep the beach and the boat for another day.`,
    });
  }

  if (signal.heatCue) {
    const { kind, tempMax, dayLabel } = signal.heatCue;
    rows.push({
      cue: "heat",
      title: kind === "very-hot" ? "Heat plan" : "Heat watch",
      body: `${dayLabel} peaks around ${Math.round(
        tempMax,
      )}°C. Move the open-air stops to early morning or after 5pm, and put a covered one in the middle of the day.`,
    });
  }

  return rows;
}
