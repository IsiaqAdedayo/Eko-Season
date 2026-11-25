import { execFileSync } from "node:child_process";
const qs = process.argv.slice(2);
for (const q of qs) {
  const enc = encodeURIComponent(q);
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=10&gsrsearch=${enc}&prop=imageinfo&iiprop=url|extmetadata|size&iiurlwidth=1200`;
  const out = execFileSync("curl", ["-s", "-A", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", url], { encoding: "utf8" });
  let d; try { d = JSON.parse(out); } catch { console.log("ERR", q, out.slice(0,200)); continue; }
  const pages = Object.values(d?.query?.pages ?? {});
  console.log("=== " + q);
  for (const p of pages) {
    const ii = (p.imageinfo ?? [{}])[0];
    const em = ii.extmetadata ?? {};
    const lic = em.LicenseShortName?.value ?? "?";
    const artist = (em.Artist?.value ?? "").replace(/<[^>]+>/g, "").trim();
    console.log(` - ${p.title} | ${lic} | ${ii.width}x${ii.height} | ${artist}`);
    console.log(`   ${ii.thumburl}`);
  }
  await new Promise(r => setTimeout(r, 2600));
}
