#!/usr/bin/env node
/**
 * Validates the hand-maintained JSON the site builds from.
 *
 * `next build` will happily ship a duplicate id or a show whose end date
 * precedes its start date; it just renders nonsense. This catches those before
 * a scrape or a hand-edit reaches a deploy.
 *
 *   node scripts/validate-data.mjs
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const readJson = async (name) =>
  JSON.parse(await readFile(path.join(ROOT, "data", name), "utf8"));

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const WEEKDAYS = new Set(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
const CATEGORIES = new Set([
  "clubs",
  "beaches",
  "eats",
  "play",
  "culture",
  "landmarks",
]);

const problems = [];
const fail = (file, id, message) =>
  problems.push(`${file}${id ? ` [${id}]` : ""}: ${message}`);

const isDate = (value) => typeof value === "string" && ISO.test(value);
const isUrl = (value) => typeof value === "string" && /^https?:\/\//.test(value);

async function validateShows() {
  const file = "shows.json";
  const data = await readJson(file);
  if (!Array.isArray(data.events)) return fail(file, null, "events is not an array");
  if (!data.updatedAt || Number.isNaN(Date.parse(data.updatedAt))) {
    fail(file, null, "updatedAt is missing or not parseable");
  }

  const ids = new Set();
  for (const event of data.events) {
    const id = event.id;
    if (!SLUG.test(id ?? "")) fail(file, id, "id is not a slug");
    if (ids.has(id)) fail(file, id, "duplicate id");
    ids.add(id);

    if (!event.title || event.title.length < 3) fail(file, id, "missing title");
    if (!isDate(event.date)) fail(file, id, `date is not ISO (${event.date})`);
    if (event.endDate && !isDate(event.endDate)) {
      fail(file, id, `endDate is not ISO (${event.endDate})`);
    }
    if (event.endDate && event.endDate < event.date) {
      fail(file, id, "endDate is before date");
    }
    if (!event.venue) fail(file, id, "missing venue");
    if (event.city !== "Lagos") fail(file, id, `unexpected city (${event.city})`);

    if (event.priceFrom != null) {
      if (typeof event.priceFrom !== "number" || event.priceFrom < 0) {
        fail(file, id, "priceFrom is not a positive number");
      }
      if (event.currency !== "NGN") fail(file, id, "currency is not NGN");
    }

    for (const tier of event.tiers ?? []) {
      if (!tier.name) fail(file, id, "tier without a name");
      if (typeof tier.price !== "number" || tier.price < 0) {
        fail(file, id, `tier "${tier.name}" has no numeric price`);
      }
    }

    if (event.ticketUrl && !isUrl(event.ticketUrl)) {
      fail(file, id, "ticketUrl is not http(s)");
    }
    if (!isUrl(event.sourceUrl)) fail(file, id, "sourceUrl is not http(s)");
    if (!event.source) fail(file, id, "missing source");

    for (const photo of event.photos ?? []) {
      if (typeof photo !== "string" || photo.length === 0) {
        fail(file, id, "empty photo path");
      }
    }
  }

  return data.events.length;
}

async function validateMovies() {
  const file = "movies.json";
  const data = await readJson(file);
  if (!Array.isArray(data.events)) return fail(file, null, "events is not an array");
  if (!data.updatedAt || Number.isNaN(Date.parse(data.updatedAt))) {
    fail(file, null, "updatedAt is missing or not parseable");
  }

  const ids = new Set();
  const junk = /\b(detty\s*december|guide|calendar|releases?|upcoming|latest|news|malumfashi|lagos|lifestyle)\b/i;

  for (const movie of data.events) {
    const id = movie.id;
    if (!SLUG.test(id ?? "")) fail(file, id, "id is not a slug");
    if (ids.has(id)) fail(file, id, "duplicate id");
    ids.add(id);

    if (!movie.title || movie.title.length < 3) fail(file, id, "missing title");
    if (junk.test(movie.title ?? "") && !/\./.test(movie.title)) {
      fail(file, id, `title looks like page copy (${movie.title})`);
    }
    if (!isDate(movie.date)) fail(file, id, `date is not ISO (${movie.date})`);
    if (movie.endDate && movie.endDate < movie.date) {
      fail(file, id, "endDate is before date");
    }
    if (!Array.isArray(movie.cinemas)) fail(file, id, "cinemas is not an array");

    for (const cinema of movie.cinemas ?? []) {
      if (!cinema.name) fail(file, id, "cinema without a name");
      if (cinema.url && !isUrl(cinema.url)) {
        fail(file, id, `cinema url is not http(s) (${cinema.url})`);
      }
    }
    if (!isUrl(movie.sourceUrl)) fail(file, id, "sourceUrl is not http(s)");
  }

  return data.events.length;
}

async function validatePlaces() {
  const file = "places.json";
  const data = await readJson(file);
  if (!Array.isArray(data)) return fail(file, null, "not an array");

  const ids = new Set();
  for (const place of data) {
    const id = place.id;
    if (!SLUG.test(id ?? "")) fail(file, id, "id is not a slug");
    if (ids.has(id)) fail(file, id, "duplicate id");
    ids.add(id);

    if (!place.name || place.name.length < 2) fail(file, id, "missing name");
    if (!CATEGORIES.has(place.category)) {
      fail(file, id, `unknown category (${place.category})`);
    }
    if (!place.area) fail(file, id, "missing area");
    if (!Array.isArray(place.gallery) || place.gallery.length === 0) {
      fail(file, id, "no gallery image");
    }
    if (!isDate(place.checkedAt)) fail(file, id, "checkedAt is not ISO");

    for (const night of place.nights ?? []) {
      if (!WEEKDAYS.has(night)) fail(file, id, `unknown night (${night})`);
    }
    if ((place.nights ?? []).length > 0) {
      if (!place.nightsSource?.url || !isUrl(place.nightsSource.url)) {
        fail(file, id, "has nights but no sourced URL");
      }
      if (!isDate(place.nightsCheckedAt)) {
        fail(file, id, "has nights but no ISO nightsCheckedAt");
      }
    }
    if (place.status && place.status !== "open" && place.status !== "closed") {
      fail(file, id, `unknown status (${place.status})`);
    }
  }

  return data.length;
}

async function validateDishes() {
  const file = "dishes.json";
  const data = await readJson(file);
  if (!Array.isArray(data)) return fail(file, null, "not an array");
  const ids = new Set();
  for (const dish of data) {
    if (!SLUG.test(dish.id ?? "")) fail(file, dish.id, "id is not a slug");
    if (ids.has(dish.id)) fail(file, dish.id, "duplicate id");
    ids.add(dish.id);
    if (!dish.name) fail(file, dish.id, "missing name");
    if (!dish.image) fail(file, dish.id, "missing image");
  }
  return data.length;
}

async function main() {
  const counts = {};
  for (const [name, run] of [
    ["shows", validateShows],
    ["movies", validateMovies],
    ["places", validatePlaces],
    ["dishes", validateDishes],
  ]) {
    try {
      counts[name] = await run();
    } catch (error) {
      fail("data", null, `${name} could not be read: ${error.message}`);
    }
  }

  if (problems.length > 0) {
    console.error(`✗ ${problems.length} data problem(s):`);
    for (const problem of problems) console.error(`  ${problem}`);
    process.exitCode = 1;
    return;
  }

  console.log(
    `✓ data ok — ${counts.shows} shows, ${counts.movies} films, ${counts.places} places, ${counts.dishes} dishes`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
