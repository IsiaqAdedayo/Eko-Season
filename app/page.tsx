import Link from "next/link";
import { SiteHeader } from "../components/site-header";
import { Hero } from "../components/hero";
import { SeasonNotice } from "../components/season-notice";
import { TonightStrip } from "../components/tonight-strip";
import { PlacesSection } from "../components/places-section";
import { Dishes } from "../components/dishes";
import { BigShows } from "../components/big-shows";
import { TransportSection } from "../components/transport-section";
import { WeatherStrip } from "../components/weather-strip";
import { SiteFooter } from "../components/site-footer";
import { plannedSeasonLabel, upcomingShows } from "../lib/season";
import { weatherNow } from "../lib/weather";

/** Home shows six of the twenty-odd shows; the calendar lives on /shows. */
const HOME_SHOWS = 6;

// The strip below the hero is date-bound: rebuild it every 15 minutes so
// "Tonight" means tonight, not the night the site was last deployed.
export const revalidate = 900;

export default async function Home() {
  // Between seasons this is empty, and the shows section says so instead of
  // re-listing last December as if it were still to come.
  const shows = upcomingShows();
  let weather: Awaited<ReturnType<typeof weatherNow>> | null = null;
  try {
    weather = await weatherNow();
  } catch {
    // Home strip is a nice-to-have; a failed fetch should not take down the home page.
    weather = null;
  }

  return (
    <main id="top">
      <SiteHeader />
      <Hero seasonLabel={plannedSeasonLabel()} />
      <SeasonNotice className="mx-auto mt-8 max-w-7xl px-6 sm:px-10" />
      <TonightStrip />
      <PlacesSection />
      <Dishes />
      <BigShows
        events={shows.slice(0, HOME_SHOWS)}
        pagination={
          <p className="mt-8 text-sm text-cream/60">
            {shows.length > HOME_SHOWS ? `Six of ${shows.length} shows. ` : ""}
            <Link
              href="/shows"
              className="text-gold underline decoration-gold/40 underline-offset-4 hover:decoration-gold"
            >
              See the full calendar →
            </Link>
          </p>
        }
      />
      <TransportSection />
      {weather && <WeatherStrip snapshot={weather} />}
      <div className="mt-auto pt-16">
        <SiteFooter />
      </div>
    </main>
  );
}
