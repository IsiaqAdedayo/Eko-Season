import type { Metadata } from "next";
import Link from "next/link";
import { BudgetPlanner } from "../../components/budget-planner";
import { ContingencyPlan } from "../../components/contingency-plan";
import { SeasonNotice } from "../../components/season-notice";
import { SiteFooter } from "../../components/site-footer";
import { nightsCheckedOn, type Place } from "../../lib/place";
import {
  addDays,
  corridorForArea,
  longDate,
  nextShowAfter,
  planDay,
  shortDay,
  showMatchesCorridor,
  todayInLagos,
  weekdayLong,
  type DayPlan,
} from "../../lib/schedule";
import { CORRIDORS, type CorridorId } from "../../lib/areas";
import { dateRange, naira, showEvents, type ShowEvent } from "../../lib/shows";
import { formatChecked, SOCIAL_IMAGE } from "../../lib/site";
import { imageUrl } from "../../lib/media";
import { allPlaces } from "../../lib/place";
import {
  tonightWeatherSignal,
  weatherNow,
  type TonightWeatherSignal,
} from "../../lib/weather";

// The page is about right now, so it must never be frozen at build time.
export const dynamic = "force-dynamic";


export const metadata: Metadata = {
  title: "Tonight in Lagos — Èkó Season",
  description:
    "What's on in Lagos tonight and for the next seven days: December shows, weekday nights out and where to go.",
  alternates: { canonical: "/tonight" },
  openGraph: {
    title: "Tonight in Lagos",
    description:
      "Shows and weekly nights out for the next seven days, from the Detty December guide.",
    url: "/tonight",
    type: "website",
    siteName: "Èkó Season",
    images: [
      {
        url: imageUrl(
          allPlaces.find((p) => p.id === "love-lagos-jetty")?.gallery[0] ??
            SOCIAL_IMAGE,
          1200,
          630,
        ),
        width: 1200,
        height: 630,
        alt: "Tonight in Lagos",
      },
    ],
  },
};

function ShowRow({ event }: { event: ShowEvent }) {
  return (
    <Link
      href={`/shows/${event.id}`}
      className="group flex items-start justify-between gap-4 rounded-2xl bg-ink p-4 text-cream transition hover:bg-ink/90"
    >
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gold">
          {dateRange(event)}
        </p>
        <p className="mt-1 font-display text-lg leading-tight">{event.title}</p>
        <p className="mt-1 text-xs text-cream/55">
          {event.venue}
          {event.area ? `, ${event.area}` : " · Location TBC"}
        </p>
      </div>
      <p className="shrink-0 text-xs text-cream/70">
        {event.priceFrom != null ? `From ${naira(event.priceFrom)}` : "TBA"}
      </p>
    </Link>
  );
}

function ClubChip({ place }: { place: Place }) {
  return (
    <Link
      href={`/places/${place.id}`}
      className="inline-flex items-baseline gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm transition hover:border-ink/40"
    >
      {place.name}
      <span className="text-[11px] text-muted">{place.area}</span>
    </Link>
  );
}

function weatherAwareTip(
  signal: TonightWeatherSignal,
  day: { date: string; shows: ShowEvent[]; clubs: Place[] },
  i: number,
) {
  if (!signal.available) return null;

  const dateLabel = i === 0 ? "Tonight" : weekdayLong(day.date);
  const weekday = weekdayLong(day.date);
  const parts: string[] = [];

  // Only the day a cue is actually about gets a line. Otherwise the same
  // sentence appears under every row — and "tonight" claims weather that the
  // signal put on another day.
  const rain = signal.rainCue;
  if (rain && rain.dayLabel === weekday) {
    const chance = Math.round(rain.pop);
    parts.push(
      i === 0
        ? `Rain is ${rain.kind === "likely" ? "likely" : "possible"} tonight (about ${chance}% chance).`
        : rain.kind === "likely"
          ? `This is the wettest day this week — about ${chance}% chance of rain.`
          : `This is the day to watch for rain — about ${chance}% chance.`,
    );
  }

  const heat = signal.heatCue;
  if (heat && heat.dayLabel === weekday) {
    const temp = Math.round(heat.tempMax);
    parts.push(
      i === 0
        ? `It’s ${heat.kind === "very-hot" ? "very warm" : "warm"} tonight (about ${temp}°C in the day ahead) — outdoor plans are better in the morning or late evening.`
        : `This is the ${heat.kind === "very-hot" ? "hottest" : "warmest"} day this week — about ${temp}°C.`,
    );
  }

  if (parts.length === 0) return null;

  return (
    <p className="mt-3 flex gap-2 text-sm leading-relaxed text-ink/80">
      <span className="shrink-0 rounded-full bg-ink/10 px-2 py-0.5 text-xs text-ink">
        {dateLabel}
      </span>
      <span>{parts.join(" ")}</span>
    </p>
  );
}

const CORRIDOR_IDS = ["lekki", "lagos-island", "mainland"] as const;

type PageProps = { searchParams: Promise<{ area?: string }> };

export default async function TonightPage({ searchParams }: PageProps) {
  const { area } = await searchParams;
  const corridor: CorridorId | null = CORRIDOR_IDS.includes(
    area as (typeof CORRIDOR_IDS)[number],
  )
    ? (area as CorridorId)
    : null;

  const today = todayInLagos();
  let signal: TonightWeatherSignal;
  try {
    signal = tonightWeatherSignal(await weatherNow());
  } catch {
    signal = { available: false, rainCue: null, heatCue: null, note: null };
  }

  // The corridor filter is a view, not a data change: venues with no published
  // area stay visible rather than vanishing from every side of town.
  const filterDay = (day: DayPlan): DayPlan =>
    corridor
      ? {
          ...day,
          shows: day.shows.filter((event) => showMatchesCorridor(event, corridor)),
          clubs: day.clubs.filter(
            (place) => corridorForArea(place.area) === corridor,
          ),
        }
      : day;

  const tonight = filterDay(planDay(today));
  const week = Array.from({ length: 6 }, (_, offset) =>
    filterDay(planDay(addDays(today, offset + 1))),
  );

  const planTip = weatherAwareTip(signal, tonight, 0);

  // Dinner before the show — the one part of a night out the listings pages
  // cannot suggest, because it depends on where the reader already is.
  const eatsNearby = allPlaces
    .filter(
      (place) =>
        place.category === "eats" &&
        (!corridor || corridorForArea(place.area) === corridor),
    )
    .slice(0, 4);

  const shownTonight = tonight.shows.length > 0;
  const upcoming = nextShowAfter(today);
  const weekHasShows = week.some((day) => day.shows.length > 0);

  return (
    <main className="bg-cream text-ink">
      <div className="mx-auto max-w-4xl px-6 pt-8 sm:px-10">
        <nav className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted">
          <Link href="/" className="transition hover:text-ink">
            ← Èkó Season
          </Link>
          <Link href="/shows" className="transition hover:text-ink">
            Full calendar
          </Link>
        </nav>

        <header className="mt-10">
          <p className="text-xs uppercase tracking-[0.3em] text-ember">
            On the ground
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            Tonight in Lagos
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            {longDate(today)} · what’s on tonight, and the six days after
            it.
          </p>
        </header>

        <SeasonNotice className="mt-6" />

        <nav
          aria-label="Filter by area"
          className="mt-6 flex flex-wrap gap-2 text-xs"
        >
          <Link
            href="/tonight"
            className={`rounded-full border px-4 py-2 transition ${
              corridor
                ? "border-ink/15 hover:border-ink/40"
                : "border-transparent bg-ink text-cream"
            }`}
          >
            All of Lagos
          </Link>
          {CORRIDOR_IDS.map((id) => (
            <Link
              key={id}
              href={`/tonight?area=${id}`}
              className={`rounded-full border px-4 py-2 transition ${
                corridor === id
                  ? "border-transparent bg-ink text-cream"
                  : "border-ink/15 hover:border-ink/40"
              }`}
            >
              {CORRIDORS[id].label}
            </Link>
          ))}
        </nav>
        {corridor && (
          <p className="mt-2 text-[11px] leading-relaxed text-muted">
            Island covers Victoria Island, Ikoyi and Onikan. Venues without a
            published area are still listed.
          </p>
        )}

        <section className="mt-10">
          <div className="flex items-baseline justify-between border-b border-ink/10 pb-2">
            <h2 className="font-display text-2xl">Tonight</h2>
            <p className="text-[11px] uppercase tracking-[0.2em] text-ember">
              {shortDay(today)}
            </p>
          </div>

          {planTip}

          {shownTonight ? (
            <div className="mt-4 grid gap-3">
              {tonight.shows.map((event) => (
                <ShowRow key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-ink/20 p-5">
              <p className="text-sm text-ink/75">
                Nothing booked in tonight.
                {upcoming ? (
                  <>
                    {" "}
                    Next up:{" "}
                    <Link
                      href={`/shows/${upcoming.id}`}
                      className="underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
                    >
                      {upcoming.title}
                    </Link>{" "}
                    on {shortDay(upcoming.date)}.
                  </>
                ) : (
                  " The festival calendar is between seasons — the weekly nights below, and the rest of the guide, still apply."
                )}
              </p>
            </div>
          )}

          {tonight.clubs.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted">
                Weekly nights
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {tonight.clubs.map((place) => (
                  <ClubChip key={place.id} place={place} />
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted">
              Nothing with a published weekly night tonight — the seven days
              below have the rest.
            </p>
          )}

          {eatsNearby.length > 0 && (
            <div className="mt-6">
              <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted">
                Eat before
              </h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {eatsNearby.map((place) => (
                  <Link
                    key={place.id}
                    href={`/places/${place.id}`}
                    className="flex items-baseline justify-between gap-3 rounded-2xl border border-ink/10 bg-white/60 px-4 py-3 text-sm transition hover:border-ink/30"
                  >
                    <span className="truncate font-medium">{place.name}</span>
                    <span className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-muted">
                      {[place.area, place.price].filter(Boolean).join(" · ")}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        <ContingencyPlan signal={signal} />

        <div className="mt-10">
          <BudgetPlanner shows={showEvents} />
        </div>

        <section className="mt-14">
          <div className="flex flex-col gap-2 border-b border-ink/10 pb-2 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 className="font-display text-2xl">The week ahead</h2>
            {!weekHasShows && upcoming && (
              <p className="text-xs text-muted">
                Shows start {shortDay(upcoming.date)} — {upcoming.title}.
              </p>
            )}
          </div>

          <div>
            {week.map((day, i) => {
              const quiet = day.shows.length === 0 && day.clubs.length === 0;
              return (
                <article
                  key={day.date}
                  className="grid gap-3 border-b border-ink/10 py-6 sm:grid-cols-[140px_1fr]"
                >
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-ember">
                      {weekdayLong(day.date)}
                    </p>
                    <p className="font-display text-xl leading-tight">
                      {shortDay(day.date)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {day.shows.map((event) => (
                      <ShowRow key={event.id} event={event} />
                    ))}

                    {day.clubs.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {day.clubs.map((place) => (
                          <ClubChip key={place.id} place={place} />
                        ))}
                      </div>
                    )}

                    {quiet && (
                      <p className="text-sm text-muted">
                        Quiet night — nothing in the calendar, and no weekly
                        night to fall back on.
                      </p>
                    )}

                    {weatherAwareTip(signal, day, i + 1)}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <p className="mt-10 text-[11px] leading-relaxed text-muted">
          Each night above is the venue’s own published schedule, last
          read {formatChecked(nightsCheckedOn)}; anywhere without one stays off
          this page. December moves things around, so confirm on the day.{" "}
          <Link
            href="/#getting-around"
            className="underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
          >
            How to get there
          </Link>
          .
        </p>
      </div>

      <div className="mt-auto pt-16">
        <SiteFooter />
      </div>
    </main>
  );
}
