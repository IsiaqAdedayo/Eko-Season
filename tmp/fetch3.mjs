import { execFileSync } from "node:child_process";
const items = {
  "jollof4": "https://upload.wikimedia.org/wikipedia/commons/0/07/Jollof_rice_with_chicken%2C_beef_and_shrimps.jpg",
  "jollof5": "https://upload.wikimedia.org/wikipedia/commons/e/ec/Jollof_rice_with_boiled_egg_and_fried_chicken.jpg",
  "jollof6": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f4/A_plate_of_jollof_rice_and_chicken.jpg/1280px-A_plate_of_jollof_rice_and_chicken.jpg",
  "chin3": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c4/LoveChinChin.jpg/1280px-LoveChinChin.jpg",
  "chin4": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Plain_Chin_Chin.jpg/1280px-Plain_Chin_Chin.jpg",
  "corn1": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/Road_side_snack_%28Roasted_Corn%29.jpg/1280px-Road_side_snack_%28Roasted_Corn%29.jpg",
  "chops3": "https://upload.wikimedia.org/wikipedia/commons/d/d4/Nigerian_Small_Chops.jpg",
  "chips2": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b7/Chips_made_from_plantain.jpg/1280px-Chips_made_from_plantain.jpg",
};
for (const [k, u] of Object.entries(items)) {
  try {
    execFileSync("curl", ["-fsSL", "-A", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36", "-e", "https://commons.wikimedia.org/", "-o", `tmp/cand/${k}.jpg`, u], { stdio: "pipe" });
    console.log(k, "ok");
  } catch (e) { console.log(k, "FAIL", String(e.status)); }
  await new Promise(r => setTimeout(r, 3000));
}
