#!/usr/bin/env node
/**
 * Checks every gallery image in data/places.json is still real.
 *
 * A dead image is invisible to `next build` and to `check:data`: the card just
 * renders a grey box in production months later. This walks the galleries,
 * resolves each entry the way the app does, and fails if anything is missing,
 * not an image, or too small to be a real photo.
 *
 *   npm run check:links
 *
 * Bare "photo-..." ids are Unsplash: they are resolved with the same rule as
 * imageUrl() in lib/media.ts, because a raw `fetch("photo-…")` throws
 * "Failed to parse URL" and looks like a dead image.
 *
 * Takes a minute or two: Wikimedia rate-limits bursts, so those are paced.
 */

import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Same resolution as imageUrl() in lib/media.ts. */
const resolveImage = (src, width = 900) =>
  src.startsWith("http") || src.startsWith("/")
    ? src
    : `https://images.unsplash.com/${src}?auto=format&fit=crop&w=${width}&q=80`;

const WIKIMEDIA = /^https:\/\/(?:upload|thumb)\.wikimedia\.org\//;
const MIN_BYTES = 3000;
const TIMEOUT_MS = 20000;
// Wikimedia asks for a contact in the agent string, and throttles hard without one.
const UA = "EkoSeasonGuide/1.0 (gallery link check; contact isiaqadedayo@outlook.com)";

const problems = [];

const kindOf = (src) => {
  if (src.startsWith("/images/")) return "self";
  if (src.startsWith("photo-")) return "unsplash";
  if (WIKIMEDIA.test(src)) return "wikimedia";
  if (/^https?:\/\//.test(src)) return "remote";
  return "unknown";
};

/** Warn if lib/media.ts changes the Unsplash template this script mirrors. */
async function checkResolutionRule() {
  const media = await readFile(path.join(ROOT, "lib", "media.ts"), "utf8");
  if (!media.includes("images.unsplash.com/${id}")) {
    problems.push(
      "lib/media.ts: the Unsplash URL template changed — update resolveImage() in this script to match",
    );
  }
}

async function checkLocal(src) {
  const file = path.join(ROOT, "public", src);
  try {
    const info = await stat(file);
    if (!info.isFile()) return "not a file";
    if (info.size < MIN_BYTES) return `only ${info.size} bytes`;
    return null;
  } catch {
    return "file missing from public/";
  }
}

/**
 * HEAD rather than GET: the answer is the same and it does not pull multi-MB
 * photos just to prove they exist. Falls back to GET when a host refuses HEAD
 * or omits content-length.
 */
const head = (url) =>
  fetch(url, { method: "HEAD", headers: { "User-Agent": UA }, signal: AbortSignal.timeout(TIMEOUT_MS) });

async function checkRemote(url, { paced = false } = {}) {
  let last = "unknown error";
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      let response = await head(url);
      if (response.status === 405 || response.status === 501) {
        response = await fetch(url, {
          headers: { "User-Agent": UA },
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
      }
      if (response.status === 429 || response.status >= 500) {
        last = `HTTP ${response.status}`;
        // Wikimedia throttles in windows; back off well past the first 429.
        await new Promise((done) => setTimeout(done, paced ? 4000 * (attempt + 1) : 2000 * (attempt + 1)));
        continue;
      }
      if (!response.ok) return `HTTP ${response.status}`;
      const type = response.headers.get("content-type") ?? "";
      if (!type.startsWith("image/")) return `not an image (${type || "no content-type"})`;
      const length = Number(response.headers.get("content-length") ?? 0);
      if (length > 0) return length < MIN_BYTES ? `only ${length} bytes` : null;
      // No length on the HEAD: ask for the body to measure it.
      const body = await fetch(url, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!body.ok) return `HTTP ${body.status}`;
      const bytes = (await body.arrayBuffer()).byteLength;
      if (bytes < MIN_BYTES) return `only ${bytes} bytes`;
      return null;
    } catch (error) {
      last = error.name === "TimeoutError" ? "timed out" : error.message;
    }
  }
  return last;
}

async function main() {
  await checkResolutionRule();

  const places = JSON.parse(await readFile(path.join(ROOT, "data", "places.json"), "utf8"));

  // One check per distinct image, however many cards share it.
  const entries = new Map();
  for (const place of places) {
    for (const src of place.gallery ?? []) {
      const url = resolveImage(src);
      if (!entries.has(url)) entries.set(url, { src, url, kind: kindOf(src), places: [] });
      entries.get(url).places.push(place.id);
    }
  }

  const all = [...entries.values()];
  const local = all.filter((entry) => entry.kind === "self");
  const remote = all.filter((entry) => entry.kind !== "self");

  for (const entry of local) {
    entry.problem = await checkLocal(entry.src);
  }

  // Wikimedia throttles parallel bursts; everything else tolerates a small pool.
  const paced = remote.filter((entry) => entry.kind === "wikimedia");
  const pooled = remote.filter((entry) => entry.kind !== "wikimedia");

  for (let i = 0; i < pooled.length; i += 6) {
    await Promise.all(
      pooled.slice(i, i + 6).map(async (entry) => {
        entry.problem = await checkRemote(entry.url);
      }),
    );
  }
  for (const entry of paced) {
    entry.problem = await checkRemote(entry.url, { paced: true });
    await new Promise((done) => setTimeout(done, 1200));
  }

  for (const entry of all) {
    if (entry.kind === "unknown") {
      entry.problem = entry.problem ?? "not a URL or an Unsplash id";
    }
    if (entry.problem) {
      problems.push(
        `${entry.places.join(", ")} → ${entry.problem}\n    ${entry.src.slice(0, 120)}`,
      );
    }
  }

  const byKind = all.reduce((counts, entry) => {
    counts[entry.kind] = (counts[entry.kind] ?? 0) + 1;
    return counts;
  }, {});
  const summary = Object.entries(byKind)
    .map(([kind, count]) => `${count} ${kind}`)
    .join(", ");

  if (problems.length > 0) {
    console.error(`✗ ${problems.length} dead gallery image(s):`);
    for (const problem of problems) console.error(`  ${problem}`);
    console.error(`\n  ${all.length} images checked (${summary}).`);
    process.exitCode = 1;
    return;
  }

  console.log(`✓ links ok — ${places.length} places, ${all.length} gallery images (${summary})`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
