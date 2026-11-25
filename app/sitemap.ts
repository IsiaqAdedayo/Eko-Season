import type { MetadataRoute } from "next";
import { allDishes } from "../lib/dishes";
import { allPlaces } from "../lib/place";
import { showEvents, showsUpdatedAt } from "../lib/shows";
import { movieEvents, moviesUpdatedAt } from "../lib/movies";
import { WEATHER_REVALIDATE } from "../lib/weather";
import { SITE_URL } from "../lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/shows`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/tonight`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/movies`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/weather`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${SITE_URL}/practicalities`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/search`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/places/area/lekki`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/places/area/lagos-island`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/places/area/mainland`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/places`, changeFrequency: "weekly", priority: 0.9 },
    ...allPlaces.map((place) => ({
      url: `${SITE_URL}/places/${place.id}`,
      lastModified: place.checkedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...allDishes.map((dish) => ({
      url: `${SITE_URL}/eat/${dish.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...showEvents.map((event) => ({
      url: `${SITE_URL}/shows/${event.id}`,
      lastModified: showsUpdatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...movieEvents.map((movie) => ({
      url: `${SITE_URL}/movies`,
      lastModified: moviesUpdatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
