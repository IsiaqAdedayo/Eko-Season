import { execFileSync } from "node:child_process";
const items = {
  "efo1": "https://upload.wikimedia.org/wikipedia/commons/6/6a/Efo_riro.jpg",
  "efo2": "https://upload.wikimedia.org/wikipedia/commons/0/04/Prepared_%28Vegetable%29_Efo_Riro.jpg",
  "jol1": "https://upload.wikimedia.org/wikipedia/commons/6/6e/Nigerian_Jollof_rice_and_Chicken_showcase_with_puff_puff.jpg",
  "jol2": "https://upload.wikimedia.org/wikipedia/commons/f/fc/Jollof_rice_with_chicken_and_cauliflower.jpg",
  "boli1": "https://upload.wikimedia.org/wikipedia/commons/7/78/Roasted_plantain_with_fish.jpg",
  "boli2": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/75/Toyosi_Onikosi%2C_Nigeria_Photo_1.jpg/1280px-Toyosi_Onikosi%2C_Nigeria_Photo_1.jpg",
};
for (const [k, u] of Object.entries(items)) {
  try { execFileSync("curl", ["-fsSL","-A","Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36","-e","https://commons.wikimedia.org/","-o",`tmp/cand/${k}.jpg`,u],{stdio:"pipe"}); console.log(k,"ok"); }
  catch(e){ console.log(k,"FAIL",String(e.status)); }
  await new Promise(r=>setTimeout(r,3000));
}
