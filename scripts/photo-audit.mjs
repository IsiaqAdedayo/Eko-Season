#!/usr/bin/env node
/**
 * Photo licensing report.
 *
 * 93 images are in use whose reuse basis is still unconfirmed — mostly
 * Google-hosted venue photos, which are the riskiest of the lot. The baseline
 * file stops new ones arriving; this script makes the backlog visible so it
 * can be worked down, and flags baseline entries that are now resolved or no
 * longer used.
 *
 *   node scripts/photo-audit.mjs
 *   node scripts/photo-audit.mjs --host=google
 */
import { readFile } from "node:fs/promises";

const credits = JSON.parse(await readFile("data/photo-credits.json", "utf8"));
const baseline = new Set(
  JSON.parse(await readFile("data/photo-pending-baseline.json", "utf8")).pending,
);
const places = JSON.parse(await readFile("data/places.json", "utf8"));

const hostFilter = process.argv.find((a) => a.startsWith("--host="))?.slice(7);
const host = (src) => {
  try {
    return new URL(src).host;
  } catch {
    return "local";
  }
};
const isPending = (src) => /pending/i.test(credits[src]?.permissionStatus ?? "");

const used = new Set(places.flatMap((place) => place.gallery));
const pendingUsed = [...used].filter(isPending);

const byHost = {};
for (const src of pendingUsed) {
  byHost[host(src)] = (byHost[host(src)] ?? 0) + 1;
}

console.log(
  `${used.size} image(s) in use, ${pendingUsed.length} with a pending reuse basis, ` +
    `${baseline.size} in the baseline.\n`,
);

const rows = Object.entries(byHost).sort((a, b) => b[1] - a[1]);
for (const [name, count] of rows) {
  if (hostFilter && !name.includes(hostFilter)) continue;
  console.log(`  ${String(count).padStart(3)}  ${name}`);
}

const affected = places.filter((place) => place.gallery.some(isPending));
console.log(`\n${affected.length} place(s) carry at least one:\n`);
for (const place of affected) {
  const sources = place.gallery.filter(isPending).map(host);
  console.log(`  ${place.id.padEnd(28)} ${sources.join(", ")}`);
}

const resolved = [...baseline].filter((src) => !isPending(src));
const unused = [...baseline].filter((src) => !used.has(src) && isPending(src));
if (resolved.length > 0 || unused.length > 0) {
  console.log("\nBaseline cleanup:");
  if (resolved.length > 0) {
    console.log(
      `  ${resolved.length} entr(y|ies) no longer pending — remove them from data/photo-pending-baseline.json`,
    );
  }
  if (unused.length > 0) {
    console.log(
      `  ${unused.length} entr(y|ies) no longer used by any place — safe to drop`,
    );
  }
}
