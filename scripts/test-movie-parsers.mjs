#!/usr/bin/env node
/**
 * Fixture tests for the movie parsers.
 *
 * The cinema sites are unreliable — sometimes down, sometimes behind a bot
 * wall — so the parsers are tested against saved markup instead of the live
 * web. `data/naijasabi-live-2026-12.html` is a real page capture, not a
 * hand-written sample.
 *
 *   node scripts/test-movie-parsers.mjs
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  isFilmRow,
  parseAMDB,
  parseDate,
  parseFromSilverbird,
  parseGenericTracker,
  parseNaijaSabi,
  slateEnd,
} from "./scrape-movies.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixture = (name) => readFile(path.join(ROOT, "scripts", "fixtures", name), "utf8");

let failures = 0;

const check = (name, condition, detail = "") => {
  if (condition) {
    console.log(`✓ ${name}`);
  } else {
    failures += 1;
    console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
};

const titles = (events) => events.map((event) => event.title);

async function main() {
  // ---- dates -----------------------------------------------------------
  check("parseDate: weekday + day + month", parseDate("Friday 4 December", 2026) === "2026-12-04");
  check("parseDate: month + day + year", parseDate("December 16, 2026") === "2026-12-16");
  check("parseDate: day + month + year", parseDate("4 Dec 2026") === "2026-12-04");
  check("parseDate: rejects prose", parseDate("coming soon", 2026) === null);

  // ---- film-row sanity -------------------------------------------------
  check("isFilmRow: real film", isFilmRow({ title: "Bestie", date: "2026-12-16" }));
  check(
    "isFilmRow: page headline rejected",
    !isFilmRow({ title: "Detty December 2026: Nollywood films and concerts", date: "2026-12-05" }),
  );
  check("isFilmRow: bad date rejected", !isFilmRow({ title: "Bestie", date: "16/12/2026" }));
  check("isFilmRow: venue name rejected", !isFilmRow({ title: "Silverbird", date: "2026-12-16" }));

  // ---- African Movie Database -----------------------------------------
  const amdb = parseAMDB(await fixture("amdb-2026-12.html"));
  check("AMDB: three films parsed", amdb.length === 3, `got ${amdb.length}`);
  check(
    "AMDB: titles and dates",
    JSON.stringify(titles(amdb)) ===
      JSON.stringify(["The Four: No One Fights Alone", "Bestie", "Jagun Jagun 2: War of Warriors"]),
    titles(amdb).join(" | "),
  );
  check("AMDB: streaming platform detected", amdb[2]?.platform === "netflix", amdb[2]?.platform);
  check("AMDB: cinema release keeps a venue", amdb[0]?.platform === "cinema");

  // ---- Silverbird ------------------------------------------------------
  const silverbird = parseFromSilverbird(await fixture("silverbird-2026-12.html"));
  check("Silverbird: two films parsed", silverbird.length === 2, `got ${silverbird.length}`);
  check(
    "Silverbird: weekday date parsed",
    silverbird[1]?.date === "2026-12-16",
    silverbird[1]?.date,
  );
  check(
    "Silverbird: section heading ignored",
    !titles(silverbird).includes("Now Showing"),
  );
  check("Silverbird: every row survives the sanity filter", silverbird.every(isFilmRow));

  // ---- NaijaSabi (real page capture) -----------------------------------
  const snapshot = await readFile(path.join(ROOT, "data", "naijasabi-live-2026-12.html"), "utf8");
  const naijasabi = parseNaijaSabi(snapshot).filter(isFilmRow);
  check("NaijaSabi: December slate parsed", naijasabi.length === 4, `got ${naijasabi.length}`);
  check(
    "NaijaSabi: expected titles",
    naijasabi.every((row) =>
      /Baba Segi|Jagun Jagun 2|The Four|Bestie/i.test(row.title),
    ),
    titles(naijasabi).join(" | "),
  );
  check(
    "NaijaSabi: date sanity",
    naijasabi.every((row) => /^2026-12-\d{2}$/.test(row.date)),
    naijasabi.map((row) => row.date).join(" | "),
  );

  // ---- generic tracker (weak fallback) ---------------------------------
  const generic = parseGenericTracker(
    "<h2>Detty December 2026: Nollywood films and concerts in Lagos</h2><p>2026-12-05</p>",
    { name: "Nollywood Reporter", url: "https://example.com/detty" },
  );
  check(
    "generic tracker: headline row filtered out",
    generic.length === 1 && !isFilmRow(generic[0]),
  );

  // ---- slate freshness -------------------------------------------------
  // December's pages keep parsing in January, so "the scrape worked" has to be
  // distinguishable from "the calendar is current".
  check(
    "slate: a future release leaves days to run",
    slateEnd([{ date: "2026-12-04" }], "2026-11-28").daysLeft === 6,
  );
  check(
    "slate: the last end date decides",
    slateEnd(
      [
        { date: "2026-12-04" },
        { date: "2026-12-11", endDate: "2027-01-10" },
      ],
      "2026-12-31",
    ).last === "2027-01-10",
  );
  check(
    "slate: a finished slate goes negative",
    slateEnd([{ date: "2026-12-04" }], "2027-01-01").daysLeft === -28,
  );
  check("slate: no dates is no slate", slateEnd([], "2026-11-28").last === null);

  console.log(
    failures === 0 ? "\n✓ movie parsers ok" : `\n✗ ${failures} parser check(s) failed`,
  );
  if (failures > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
