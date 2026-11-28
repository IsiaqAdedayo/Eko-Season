#!/usr/bin/env node
/**
 * The weekly refresh, as a local macOS LaunchAgent.
 *
 * The rollover code only helps if the scrapers actually run, so this writes a
 * user agent that runs scripts/refresh-all.sh every Monday at 07:00 — no
 * server, no CI, nothing outside this machine.
 *
 *   node scripts/refresh-schedule.mjs              # print the plist (stdout)
 *   node scripts/refresh-schedule.mjs --install    # write it and load it
 *   node scripts/refresh-schedule.mjs --run        # trigger it now
 *   node scripts/refresh-schedule.mjs --uninstall  # unload and remove it
 *
 * The job's exit status is the alert: refresh-all.sh scrapes both feeds,
 * validates the data, runs the health check, and raises a desktop notification
 * when any of those fail. Logs: ~/Library/Logs/ekoseason-refresh.log.
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LABEL = "com.ekoseason.refresh";
const PLIST_PATH = path.join(os.homedir(), "Library/LaunchAgents", `${LABEL}.plist`);
const LOG_PATH = path.join(os.homedir(), "Library/Logs", "ekoseason-launchd.log");

/** Monday, 07:00 local. A sleeping Mac runs it at the next wake. */
const SCHEDULE = { Weekday: 1, Hour: 7, Minute: 0 };

const uid = typeof process.getuid === "function" ? process.getuid() : 501;
const domain = `gui/${uid}`;

const xml = (value) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>${xml(path.join(ROOT, "scripts/refresh-all.sh"))}</string>
  </array>
  <key>WorkingDirectory</key>
  <string>${xml(ROOT)}</string>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Weekday</key>
    <integer>${SCHEDULE.Weekday}</integer>
    <key>Hour</key>
    <integer>${SCHEDULE.Hour}</integer>
    <key>Minute</key>
    <integer>${SCHEDULE.Minute}</integer>
  </dict>
  <key>StandardOutPath</key>
  <string>${xml(LOG_PATH)}</string>
  <key>StandardErrorPath</key>
  <string>${xml(LOG_PATH)}</string>
  <key>RunAtLoad</key>
  <false/>
</dict>
</plist>
`;

const notes = `
Weekly at 07:00 on Monday, local time. Node: ${process.execPath}
Project: ${ROOT}
Plist:   ${PLIST_PATH}
Log:     ${LOG_PATH}

  install    node scripts/refresh-schedule.mjs --install
  run now    node scripts/refresh-schedule.mjs --run
  remove     node scripts/refresh-schedule.mjs --uninstall

Without launchd (any platform incl. Linux):

  0 7 * * 1 cd "${ROOT}" && /bin/bash scripts/refresh-all.sh

That cron line alerts the same way — refresh-all.sh notifies and exits non-zero.
`;

function launchctl(...args) {
  const result = spawnSync("launchctl", args, { stdio: "inherit" });
  return result.status ?? 1;
}

const command = process.argv[2] ?? "";

if (process.platform !== "darwin" && command !== "") {
  console.error("launchd is macOS-only; use the cron line printed below.");
  console.error(notes);
  process.exit(1);
}

switch (command) {
  case "--install": {
    mkdirSync(path.dirname(PLIST_PATH), { recursive: true });
    writeFileSync(PLIST_PATH, plist, "utf8");
    // Replace an older copy rather than stacking two jobs.
    launchctl("bootout", `${domain}/${LABEL}`);
    const status = launchctl("bootstrap", domain, PLIST_PATH);
    if (status !== 0) {
      console.error(
        `\nCould not load the job. The plist is written; load it with:\n  launchctl bootstrap ${domain} "${PLIST_PATH}"`,
      );
      process.exit(status);
    }
    console.log(`\nInstalled ${LABEL}. Next run: Monday ${String(SCHEDULE.Hour).padStart(2, "0")}:${String(SCHEDULE.Minute).padStart(2, "0")}.`);
    console.log(`Test it now with: node scripts/refresh-schedule.mjs --run`);
    break;
  }

  case "--run":
    process.exit(launchctl("kickstart", "-k", `${domain}/${LABEL}`));

  case "--uninstall":
    launchctl("bootout", `${domain}/${LABEL}`);
    if (existsSync(PLIST_PATH)) rmSync(PLIST_PATH);
    console.log(`Removed ${LABEL}.`);
    break;

  case "":
    // Plist on stdout so it can be inspected or piped; notes on stderr.
    process.stdout.write(plist);
    console.error(notes);
    break;

  default:
    console.error(`Unknown option "${command}".`);
    console.error(notes);
    process.exit(2);
}
