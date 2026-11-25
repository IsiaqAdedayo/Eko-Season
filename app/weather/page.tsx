import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "../../components/site-footer";
import { imageUrl } from "../../lib/media";
import { formatChecked, SOCIAL_IMAGE } from "../../lib/site";
import {
  weatherNow,
  weatherStrip,
  tonightWeatherSignal,
  type WeatherSnapshot,
} from "../../lib/weather";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Weather in Lagos — Èkó Season",
  description:
    "Lagos weather forecast for the next seven days: temperature, rain chances and wind, to help you plan when to move around the city.",
  alternates: { canonical: "/weather" },
  openGraph: {
    type: "website",
    siteName: "Èkó Season",
    url: "/weather",
    title: "Lagos weather forecast",
    description:
      "Seven-day weather for Lagos — temperature, rain probability and wind from Open-Meteo.",
    images: [
      {
        url: imageUrl(
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Tarkwa_Bay_Beach_Front.jpg/1920px-Tarkwa_Bay_Beach_Front.jpg",
          1200,
          630,
        ),
        width: 1200,
        height: 630,
        alt: "Lagos weather forecast",
      },
    ],
  },
};

function windDirCardinal(deg: number | null) {
  if (deg == null) return "—";
  const cardinals = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const i = Math.round(deg / 22.5) % 16;
  return cardinals[i];
}

function dayRow(snapshot: WeatherSnapshot, day: {
  date: string;
  weekday: string;
  tempMax: number | null;
  tempMin: number | null;
  tempFeelMax: number | null;
  pop: number | null;
  windSpeed: number | null;
  windDir: number | null;
  condition: string;
}) {
  return (
    <div className="grid gap-2 rounded-2xl border border-cream/10 bg-white/60 px-5 py-4 sm:grid-cols-[auto_1fr_auto]">
      <div className="flex flex-col items-start gap-1">
        <p className="text-[11px] uppercase tracking-[0.2em] text-ember font-medium">
          {day.weekday.slice(0, 3)}
        </p>
        <p className="font-display text-xl">{day.date.slice(8)}</p>
      </div>

      <div className="flex flex-col gap-1 text-sm">
        <p className="text-muted">{day.condition}</p>
        <p className="text-ink/80">
          {day.tempMin != null && day.tempMax != null
            ? `${Math.round(day.tempMin)}–${Math.round(day.tempMax)}°C`
            : day.tempMax != null
              ? `${Math.round(day.tempMax)}°C`
              : "—"}
          {day.tempFeelMax != null ? `, feels like ${Math.round(day.tempFeelMax)}°C` : ""}
        </p>
        <p className="text-xs text-muted">
          {day.pop != null ? `${Math.round(day.pop)}% chance of rain` : "No rain data"}
          {day.windSpeed != null ? ` · ${Math.round(day.windSpeed)} km/h ${windDirCardinal(day.windDir)}` : ""}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 text-xs">
        {day.pop != null && day.pop >= 40 ? (
          <span className="inline-flex h-7 items-center rounded-full bg-ember/10 px-3 text-ember font-medium">
            Rain likely
          </span>
        ) : day.pop != null && day.pop >= 15 ? (
          <span className="inline-flex h-7 items-center rounded-full bg-amber-300/15 px-3 text-amber-600 font-medium">
            Watch the sky
          </span>
        ) : (
          <span className="inline-flex h-7 items-center rounded-full bg-emerald-600/10 px-3 text-emerald-700 font-medium">
            Dry
          </span>
        )}
      </div>
    </div>
  );
}

export default async function WeatherPage() {
  let snapshot: WeatherSnapshot;
  let fetchError: string | null = null;
  try {
    snapshot = await weatherNow();
  } catch (error) {
    fetchError = error instanceof Error ? error.message : String(error);
    // Degraded mode: show a friendly message instead of an error page.
    snapshot = {
      source: "Open-Meteo (CC BY 4.0)",
      fetchedAt: new Date().toISOString().slice(0, 10),
      today: {
        date: new Date().toISOString().slice(0, 10),
        weekday: new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "Africa/Lagos" }).format(new Date()),
        tempMax: null,
        tempMin: null,
        tempFeelMax: null,
        pop: null,
        rain: null,
        windSpeed: null,
        windDir: null,
        weatherCode: null,
        condition: "Unavailable",
      },
      days: [],
      degraded: true,
    };
  }
  const strip = weatherStrip(snapshot);
  const signal = tonightWeatherSignal(snapshot);
  const { today, days } = snapshot;

  return (
    <main className="bg-cream text-ink">
      <div className="mx-auto max-w-3xl px-6 pt-8 sm:px-10">
        <nav className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted">
          <Link href="/" className="transition hover:text-ink">
            ← Èkó Season
          </Link>
          <Link href="/places?category=beaches" className="transition hover:text-ink">
            Beaches
          </Link>
        </nav>

        <header className="mt-10">
          <p className="text-xs uppercase tracking-[0.3em] text-ember">On the ground</p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            Weather in Lagos
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            Seven-day forecast to help you decide when to beach, when to duck inside, and when to leave earlier than you planned.
          </p>
        </header>

        <section className="mt-10">
          <div className="flex items-baseline justify-between border-b border-ink/10 pb-3">
            <h2 className="font-display text-2xl">Today</h2>
            <p className="text-[11px] uppercase tracking-[0.2em] text-ember">
              {today.weekday}
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-cream/10 bg-white/60 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.2em] text-ember font-medium">Today's outlook</p>
                <p className="mt-1 font-display text-3xl leading-tight">
                  {today.tempMax != null ? `${Math.round(today.tempMax)}°C` : "—"}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {today.condition}
                  {today.tempFeelMax != null ? `, feels like ${Math.round(today.tempFeelMax)}°C` : ""}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 text-sm">
                {today.pop != null ? (
                  <p className="text-muted">
                    {today.pop >= 40
                      ? `${Math.round(today.pop)}% rain — take an umbrella`
                      : today.pop >= 15
                        ? `${Math.round(today.pop)}% rain — possible showers`
                        : `${Math.round(today.pop)}% rain — likely dry`}
                  </p>
                ) : (
                  <p className="text-muted">Rain data unavailable</p>
                )}
                {today.windSpeed != null && (
                  <p className="text-muted">
                    Wind {Math.round(today.windSpeed)} km/h {windDirCardinal(today.windDir)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.12em]">
              <span className="rounded-full bg-ink px-3 py-1 text-cream">
                {today.tempMin != null && today.tempMax != null
                  ? `${Math.round(today.tempMin)}–${Math.round(today.tempMax)}°C`
                  : "—"}
              </span>
              {today.pop != null ? (
                <span className="rounded-full bg-ink/10 px-3 py-1 text-ink">
                  {Math.round(today.pop)}% rain
                </span>
              ) : null}
              {today.windSpeed != null ? (
                <span className="rounded-full bg-ink/10 px-3 py-1 text-ink">
                  {Math.round(today.windSpeed)} km/h {windDirCardinal(today.windDir)}
                </span>
              ) : null}
            </div>
          </div>
        </section>

        {fetchError && (
          <section className="mt-8 rounded-2xl border border-ember/20 bg-ember/5 p-4">
            <p className="text-sm text-ember">
              Couldn&rsquo;t load the live forecast ({fetchError.slice(0, 80)}). The page will refresh automatically — try again in a few minutes, or check{" "}
              <a
                href="https://open-meteo.com/"
                target="_blank"
                rel="noreferrer"
                className="underline decoration-ember/40 underline-offset-4 hover:decoration-ember"
              >
                Open-Meteo directly
              </a>
              .
            </p>
          </section>
        )}

        <section className="mt-12">
          <div className="flex items-baseline justify-between border-b border-ink/10 pb-3">
            <h2 className="font-display text-2xl">The next six days</h2>
            <p className="text-[11px] uppercase tracking-[0.2em] text-ember">
              {snapshot.source}
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {days.map((day) => dayRow(snapshot, day))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-ink/10 bg-white/60 p-5">
          <h2 className="font-display text-xl">Plan around it</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink/80">
            {strip.todayTemp != null && (
              <p className="flex gap-3">
                <span className="shrink-0 rounded-full bg-ink/10 px-2 py-0.5 text-xs text-ink">
                  Today
                </span>
                {strip.todayTemp >= 32
                  ? "Hot enough that midday beach time is about shade, not sun. Morning and late afternoon are the comfortable windows."
                  : strip.todayTemp >= 28
                    ? "Warm and workable for a beach day, but the peak hours still feel like midday Lagos."
                    : strip.todayTemp >= 24
                      ? "Comfortable beach weather if there's a breeze. Good for a long afternoon."
                      : "On the cool side for a Lagos beach — fine for a walk, less ideal for sunbathing."}
              </p>
            )}
            {strip.todayPop != null && strip.todayPop >= 40 && (
              <p className="flex gap-3">
                <span className="shrink-0 rounded-full bg-ember/10 px-2 py-0.5 text-xs text-ember font-medium">
                  Rain likely today
                </span>
                Swimming is still possible in short windows, but a beach day today is a gamble. Move it to{" "}
                {strip.wettestDay != null ? strip.wettestDay : "a drier day"} if you can.
              </p>
            )}
            {strip.hottestTemp != null && (
              <p className="flex gap-3">
                <span className="shrink-0 rounded-full bg-ink/10 px-2 py-0.5 text-xs text-ink">
                  Hottest day
                </span>
                {strip.hottestDay} is the warmest of the next six days at about {Math.round(strip.hottestTemp)}°C.
                Plan outdoor stuff for morning or late afternoon, and carry water.
              </p>
            )}
            {strip.wettestPop != null && strip.wettestPop >= 40 && (
              <p className="flex gap-3">
                <span className="shrink-0 rounded-full bg-ember/10 px-2 py-0.5 text-xs text-ember font-medium">
                  Wettest day
                </span>
                {strip.wettestDay} looks like the day to skip the beach and pick a cinema, museum or covered spot instead.
              </p>
            )}

            {signal.rainCue && (
              <p className="flex gap-3">
                <span className="shrink-0 rounded-full bg-ember/10 px-2 py-0.5 text-xs text-ember font-medium">
                  {signal.rainCue.kind === "likely" ? "Rain likely" : "Watch the sky"}
                </span>
                {signal.rainCue.kind === "likely"
                  ? `The wettest day in the next week is ${signal.rainCue.dayLabel} (about ${Math.round(signal.rainCue.pop)}% rain). Beach plans are a gamble that day — a cinema, museum or covered spot is the safer bet.`
                  : `Rain is possible in the next week, especially ${signal.rainCue.dayLabel} (about ${Math.round(signal.rainCue.pop)}% chance). Outdoor plans still work, just keep an eye on the sky.`}
              </p>
            )}
            {signal.heatCue && (
              <p className="flex gap-3">
                <span className="shrink-0 rounded-full bg-ink/10 px-2 py-0.5 text-xs text-ink">
                  {signal.heatCue.kind === "very-hot" ? "Very warm" : "Warm"}
                </span>
                {signal.heatCue.kind === "very-hot"
                  ? `The warmest day in the next week is ${signal.heatCue.dayLabel} (about ${Math.round(signal.heatCue.tempMax)}°C). Plan outdoor stuff for morning or late afternoon and carry water.`
                  : `The warmest day in the next week is ${signal.heatCue.dayLabel} (about ${Math.round(signal.heatCue.tempMax)}°C). Fine for daytime, with the peak hours still feeling like Lagos midday.`}
              </p>
            )}
          </div>
        </section>

        <p className="mt-8 text-[11px] leading-relaxed text-muted">
          Forecast from{" "}
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
          >
            Open-Meteo
          </a>{" "}
          (CC BY 4.0), fetched {formatChecked(snapshot.fetchedAt)}. Forecasts change — check again the day you travel.{" "}
          <Link
            href="/places?category=beaches"
            className="underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
          >
            Beaches
          </Link>{" "}
          and{" "}
          <Link
            href="/places?category=play"
            className="underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
          >
            cinemas
          </Link>{" "}
          are good backups when the sky says no.
        </p>
      </div>

      <div className="mt-auto pt-20">
        <SiteFooter />
      </div>
    </main>
  );
}
