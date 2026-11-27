const sqxml = "https://dooshimabeachlagos.com/page-data/sqxml/";

async function main() {
  const text = await fetch(sqxml).then((r) => r.text());
  const found = new Set();
  for (const m of text.matchAll(/["']([^"']*\.(?:webp|jpg|png))["']/g)) {
    const u = m[1];
    if (/\.(webp|jpg|png)$/i.test(u) && /(images|opengraph|og-image|og-front)/i.test(u)) {
      found.add("https://dooshimabeachlagos.com" + u);
    }
  }
  console.log("sqxml media urls:");
  for (const u of found) console.log(" -", u);
  console.log("count:", found.size);
}

main().then(() => process.exit(0)).catch((e) => {
  console.log("ERR sqxml", e?.message || e);
  process.exit(1);
});
