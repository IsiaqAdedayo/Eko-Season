import { execFileSync } from "node:child_process";
const slugs = ["nigerian-puff-puff","akara-bean-cakes","nigerian-meat-pie","nigerian-egg-roll","nigerian-jollof-rice","egusi-soup","efo-riro-spinach-stew","beef-suya-recipe","catfish-pepper-soup","nigerian-buns"];
for (const slug of slugs) {
  const url = `https://joyfulcook.com/recipe/${slug}/`;
  const html = execFileSync("curl", ["-s","-A","Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36", url], { encoding: "utf8", maxBuffer: 1e8 });
  const og = (html.match(/property="og:image"[^>]*content="([^"]+)"/) || [])[1];
  const twitter = (html.match(/name="twitter:image"[^>]*content="([^"]+)"/) || [])[1];
  const title = (html.match(/<title>([^<]+)<\/title>/) || [])[1];
  console.log(JSON.stringify({ slug, title, og, twitter }, null, 0));
  await new Promise(r => setTimeout(r, 1200));
}
