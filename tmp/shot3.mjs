import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9335;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = spawn(CHROME, ["--headless=new","--disable-gpu","--hide-scrollbars","--no-first-run",`--remote-debugging-port=${PORT}`,"--user-data-dir=/tmp/chrome-eko5","--window-size=1440,1000","about:blank"], { stdio: "ignore" });
let target;
for (let i = 0; i < 60; i++) {
  try { const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); target = list.find((t) => t.type === "page"); if (target) break; } catch {}
  await sleep(250);
}
if (!target) { chrome.kill(); throw new Error("no target"); }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const mid = ++id; const t = setTimeout(() => { pending.delete(mid); reject(new Error("timeout " + method)); }, 20000);
  pending.set(mid, (m) => { clearTimeout(t); m.error ? reject(new Error(m.error.message)) : resolve(m.result); });
  ws.send(JSON.stringify({ id: mid, method, params }));
});
const jobs = [
  { url: "http://localhost:3000/eat/amala-ewedu", out: "screenshots/dish-amala-full.png" },
  { url: "http://localhost:3000/places/jaekel-house", out: "screenshots/landmark-jaekel-full.png" },
];
try {
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  for (const job of jobs) {
    await send("Page.navigate", { url: job.url });
    await sleep(4500);
    const m = await send("Page.getLayoutMetrics");
    const h = Math.ceil(m.cssContentSize.height);
    const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: 1440, height: h, scale: 1 } });
    writeFileSync(job.out, Buffer.from(shot.data, "base64"));
    console.log(job.out, "1440x" + h);
  }
} finally { ws.close(); chrome.kill(); }
