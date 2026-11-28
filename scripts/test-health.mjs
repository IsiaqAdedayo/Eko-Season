#!/usr/bin/env node
/**
 * Tests for scripts/check-health.mjs.
 *
 * The health check is the only thing standing between a bad week and a silent
 * guide, and its rules are easy to break silently: three date fields on a
 * place, per-category limits, a heartbeat on the refresh log. Each case here
 * writes a small fixture directory, runs the real script against it with
 * DATA_DIR, and asserts the exit code and message.
 */
import { mkdtemp, rm, writeFile, unlink } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";

const dir = await mkdtemp(path.join(os.tmpdir(), "eko-health-"));
const day = 86_400_000;
const isoAt = (daysAgo) =>
  new Date(Date.now() - daysAgo * day).toISOString().slice(0, 10);
const todayIso = () => new Date().toISOString();

const write = (name, value) =>
  writeFile(path.join(dir, name), `${JSON.stringify(value, null, 2)}\n`);

let passed = 0;
const failures = [];

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function fixture({ places, logDaysAgo = 0, withLog = true }) {
  await write("show-source-status.json", {
    checkedAt: todayIso(),
    sources: [{ name: "Detty December Fest", ok: true, events: 12 }],
  });
  await write("movie-source-status.json", {
    checkedAt: todayIso(),
    sources: [{ name: "NaijaSabi", ok: true, films: 4 }],
  });
  await write("movies.json", {
    updatedAt: todayIso(),
    events: [{ id: "film", title: "Film", date: isoAt(-30) }],
  });
  await write("places.json", places);
  const log = path.join(dir, "refresh.log");
  if (withLog) {
    await writeFile(
      log,
      `===== ${isoAt(logDaysAgo)} 07:00:00 WAT refresh start (node v22.17.0) =====\nok\n`,
    );
  } else {
    await unlink(log).catch(() => {});
  }
  return log;
}

function run(logPath) {
  const env = { ...process.env, DATA_DIR: dir, REFRESH_LOG: logPath };
  delete env.PLACES_MAX_AGE_DAYS;
  return spawnSync(process.execPath, ["scripts/check-health.mjs"], {
    env,
    encoding: "utf8",
  });
}

const place = (overrides) => ({
  id: "place",
  category: "eats",
  status: "active",
  checkedAt: isoAt(1),
  listedAt: isoAt(1),
  ...overrides,
});

console.log("check-health");

{
  const log = await fixture({ places: [place({})] });
  const result = run(log);
  check("fresh data passes", result.status === 0, result.stderr.trim());
}

{
  const log = await fixture({
    places: [place({ id: "stale-eat", checkedAt: isoAt(100), listedAt: isoAt(100) })],
  });
  const result = run(log);
  check(
    "an eats place past 90 days fails",
    result.status === 1 && /stale-eat \(100d > 90d\)/.test(result.stderr),
    result.stderr.trim(),
  );
}

{
  const log = await fixture({
    places: [
      place({ id: "middle-club", category: "clubs", checkedAt: isoAt(120), listedAt: isoAt(120) }),
    ],
  });
  const result = run(log);
  check(
    "a club is still fine at 120 days (per-category limits)",
    result.status === 0,
    result.stderr.trim(),
  );
}

{
  const log = await fixture({
    places: [
      place({ id: "old-club", category: "clubs", checkedAt: isoAt(200), listedAt: isoAt(200) }),
    ],
  });
  const result = run(log);
  check(
    "a club past 180 days fails",
    result.status === 1 && /old-club \(200d > 180d\)/.test(result.stderr),
    result.stderr.trim(),
  );
}

{
  const log = await fixture({
    places: [{ id: "undated", category: "eats", status: "active" }],
  });
  const result = run(log);
  check(
    "a place with no date at all fails",
    result.status === 1 && /undated/.test(result.stderr),
    result.stderr.trim(),
  );
}

{
  const log = await fixture({
    places: [place({ id: "verified", verifiedAt: isoAt(2) })],
  });
  const result = run(log);
  check(
    "verifiedAt wins over an older listedAt",
    result.status === 0,
    result.stderr.trim(),
  );
}

{
  const log = await fixture({ places: [place({})], logDaysAgo: 30 });
  const result = run(log);
  check(
    "a refresh log that stopped 30 days ago fails",
    result.status === 1 && /has not run for \d+ days/.test(result.stderr),
    result.stderr.trim(),
  );
}

{
  const log = await fixture({ places: [place({})], withLog: false });
  const result = run(log);
  check(
    "a missing log is not a failure on a fresh checkout",
    result.status === 0,
    result.stderr.trim(),
  );
}

await rm(dir, { recursive: true, force: true });

console.log(
  failures.length === 0
    ? `\n✓ check-health: ${passed} assertions`
    : `\n✗ check-health: ${failures.length} failed\n  - ${failures.join("\n  - ")}`,
);
process.exit(failures.length === 0 ? 0 : 1);
