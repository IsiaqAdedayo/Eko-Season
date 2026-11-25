import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9333;
const jobs = [
  { url: "http://localhost:3000/eat/amala-ewedu", out: "screenshots/dish-amala-full.png", full: true },
  { url: "http://localhost:3000/", out: "screenshots/landmarks-home.png", selector: "#landmarks" },
  { url: "http://localhost:3000/places/jaekel-house", out: "screenshots/landmark-jaekel-full.png", full: true },
];

const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
  `--remote-debugging-port=${PORT}`, "--user-data-dir=/tmp/chrome-eko-cdp",
  "--window-size=1440,1000", "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 60; i++) {
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json`);
    const list = await res.json();
    target = list.find((t) => t.type === "page");
    if (target) break;
  } catch {}
  await sleep(250);
}
if (!target) { chrome.kill(); throw new Error("no chrome target"); }

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const mid = ++id;
  pending.set(mid, (msg) => (msg.error ? reject(new Error(method + ": " + msg.error.message)) : resolve(msg.result)));
  ws.send(JSON.stringify({ id: mid, method, params }));
});

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });

for (const job of jobs) {
  await send("Page.navigate", { url: job.url });
  for (let i = 0; i < 80; i++) {
    const r = await send("Runtime.evaluate", { expression: "document.readyState", returnByValue: true });
    if (r.result.value === "complete") break;
    await sleep(200);
  }
  await send("Runtime.evaluate", {
    expression: `Promise.all(Array.from(document.images).map(i => i.complete ? Promise.resolve() : new Promise(r => { i.onload = i.onerror = r; }))).then(() => document.fonts.ready)`,
    awaitPromise: true,
  });
  await sleep(700);
  const metrics = await send("Page.getLayoutMetrics");
  const pageH = Math.ceil(metrics.cssContentSize.height);
  let clip;
  if (job.selector) {
    const r = await send("Runtime.evaluate", {
      expression: `(() => { const el = document.querySelector(${JSON.stringify(job.selector)}); if (!el) return null; const b = el.getBoundingClientRect(); return { top: b.top + window.scrollY, height: b.height }; })()`,
      returnByValue: true,
    });
    const box = r.result.value;
    clip = { x: 0, y: Math.max(0, Math.round(box.top)), width: 1440, height: Math.ceil(box.height), scale: 1 };
  } else {
    clip = { x: 0, y: 0, width: 1440, height: pageH, scale: 1 };
  }
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip });
  writeFileSync(job.out, Buffer.from(shot.data, "base64"));
  console.log(job.out, clip.width + "x" + clip.height, "page", pageH);
}

ws.close();
chrome.kill();
