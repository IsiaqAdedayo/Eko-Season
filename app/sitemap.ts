import type { MetadataRoute } from "next";
import { allDishes } from "../lib/dishes";
import { allPlaces } from "../lib/place";
import { clubs } from "../data/clubs";
import { markets } from "../data/activities";
import { showEvents, showsUpdatedAt } from "../lib/shows";
import { movieEvents, moviesUpdatedAt } from "../lib/movies";
import { SITE_URL } from "../lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/activities`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/places`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/places/area/lekki`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/places/area/lagos-island`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/places/area/mainland`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/search`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/shows`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/tonight`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/movies`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/weather`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${SITE_URL}/practicalities`, changeFrequency: "monthly", priority: 0.7 },
    ...allPlaces.map((place) => ({
      url: `${SITE_URL}/places/${place.id}`,
      lastModified: place.checkedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),

    ...showEvents.map((event) => ({
      url: `${SITE_URL}/shows/${event.id}`,
      lastModified: showsUpdatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...movieEvents.map((movie) => ({
      url: `${SITE_URL}/movies/${movie.id}`,
      lastModified: moviesUpdatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    // Football clubs — static pages generated from generateStaticParams in
    // app/clubs/[id]/page.tsx. lastModified set to 2026-11-26, the last photo
    // and content check for the venues in data/places/activities/clubs.
    // Ikorodu United is the only DoNF club here (not top flight), so it is
    // crawled less often and weighted a little lower than the other three.
    { url: `${SITE_URL}/clubs`, changeFrequency: "weekly", priority: 0.8 },
    ...clubs.map((club) => ({
      url: `${SITE_URL}/clubs/${club.id}`,
      lastModified: "2026-11-26",
      changeFrequency: club.id === "ikorodu-united" ? "monthly" as const : "weekly" as const,
      priority: club.id === "ikorodu-united" ? 0.6 : 0.8,
    })),
    // Markets — static pages generated from generateStaticParams in
    // app/markets/[id]/page.tsx. Their marketDetail is read from
    // data/marketDetail.ts and last checked 2026-11-26, alongside the card data
    // which lives in data/activities.ts (same checkedAt for the card).
    { url: `${SITE_URL}/markets`, changeFrequency: "weekly", priority: 0.8 },
    ...markets.map((market) => ({
      url: `${SITE_URL}/markets/${market.id}`,
      lastModified: "2026-11-26",
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
