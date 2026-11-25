import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9334;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
  `--remote-debugging-port=${PORT}`, "--user-data-dir=/tmp/chrome-eko3",
  "--window-size=1440,1500", "about:blank",
], { stdio: "ignore" });

let target;
for (let i = 0; i < 60; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
    target = list.find((t) => t.type === "page");
    if (target) break;
  } catch {}
  await sleep(250);
}
if (!target) { chrome.kill(); throw new Error("no target"); }

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const mid = ++id;
  const t = setTimeout(() => { pending.delete(mid); reject(new Error("timeout " + method)); }, 15000);
  pending.set(mid, (m) => { clearTimeout(t); m.error ? reject(new Error(method + ": " + m.error.message)) : resolve(m.result); });
  ws.send(JSON.stringify({ id: mid, method, params }));
});

try {
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1500, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: "http://localhost:3000/" });
  await sleep(6000);
  const r = await send("Runtime.evaluate", {
    expression: `(() => { const el = document.querySelector('#landmarks'); if (!el) return {ok:false}; const top = el.getBoundingClientRect().top + window.scrollY; window.scrollTo(0, top - 40); return {ok:true, top, height: el.getBoundingClientRect().height}; })()`,
    returnByValue: true,
  });
  console.log("section", JSON.stringify(r.result.value));
  await sleep(1500);
  const shot = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync("screenshots/landmarks-home.png", Buffer.from(shot.data, "base64"));
  console.log("saved");
} finally {
  ws.close();
  chrome.kill();
}
