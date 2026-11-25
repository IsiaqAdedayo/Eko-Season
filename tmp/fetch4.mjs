import { execFileSync } from "node:child_process";
const items = {
  "dodo1": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/Dodo_fried.jpg/1280px-Dodo_fried.jpg",
  "dodo2": "https://upload.wikimedia.org/wikipedia/commons/d/d4/Fried_Plantain_%28D%C3%B2d%C3%B2%29.jpg",
  "dodo3": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Dodo%28Fried_ripe_plantains%29_and_Chicken.jpg/1280px-Dodo%28Fried_ripe_plantains%29_and_Chicken.jpg",
};
for (const [k, u] of Object.entries(items)) {
  try { execFileSync("curl", ["-fsSL","-A","Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36","-e","https://commons.wikimedia.org/","-o",`tmp/cand/${k}.jpg`,u],{stdio:"pipe"}); console.log(k,"ok"); }
  catch(e){ console.log(k,"FAIL",String(e.status)); }
  await new Promise(r=>setTimeout(r,3000));
}
