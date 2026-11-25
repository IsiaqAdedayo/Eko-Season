import Link from "next/link";
import {
  weatherNow,
  weatherStrip,
  tonightWeatherSignal,
  type WeatherSnapshot,
} from "../lib/weather";

function windDirCardinal(deg: number | null) {
  if (deg == null) return "";
  const cardinals = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
  ];
  const i = Math.round(deg / 22.5) % 16;
  return cardinals[i];
}

export async function WeatherStrip({ snapshot }: { snapshot: WeatherSnapshot }) {
  const strip = weatherStrip(snapshot);
  const { today } = snapshot;

  return (
    <section className="bg-cream border-t border-ink/10 py-10">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <p className="text-xs uppercase tracking-[0.3em] text-ember font-medium">
          Weather in Lagos
        </p>
        <p className="mt-1 text-sm text-muted max-w-2xl">
          {today.condition}.{" "}
          {today.tempMax != null ? `${Math.round(today.tempMax)}°C today` : "No temperature data"}
          {today.tempFeelMax != null ? `, feels like ${Math.round(today.tempFeelMax)}°C` : ""}
          {today.pop != null ? `, ${Math.round(today.pop)}% chance of rain` : ""}
          {today.windSpeed != null ? `, wind ${Math.round(today.windSpeed)} km/h ${windDirCardinal(today.windDir)}` : ""}
          . Forecast from Open-Meteo (CC BY 4.0).
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          {strip.hottestDay != null && strip.hottestTemp != null && (
            <Link
              key="hottest"
              href="/weather"
              className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream transition hover:bg-ember"
            >
              Hottest day: {strip.hottestDay} · {Math.round(strip.hottestTemp)}°C
            </Link>
          )}
          {strip.wettestDay != null && strip.wettestPop != null && strip.wettestPop >= 30 && (
            <Link
              key="wettest"
              href="/weather"
              className="rounded-full bg-ember/10 px-4 py-2 text-sm font-medium text-ember transition hover:bg-ember/20"
            >
              Wettest day: {strip.wettestDay} · {Math.round(strip.wettestPop)}% rain
            </Link>
          )}
          <Link
            key="forecast"
            href="/weather"
            className="rounded-full border border-ink/20 px-4 py-2 text-sm text-ink transition hover:border-ink/40"
          >
            7-day forecast →
          </Link>
        </div>
      </div>
    </section>
  );
}
