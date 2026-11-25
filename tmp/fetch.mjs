import { execFileSync } from "node:child_process";
const items = {
  "puff1": "https://upload.wikimedia.org/wikipedia/commons/a/a3/Nigerian-puff-puff-recipe_cropped.jpg",
  "puff2": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5e/Puff_Puff.jpg/1280px-Puff_Puff.jpg",
  "akara1": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/55/Akara_with_yagi.jpg/1280px-Akara_with_yagi.jpg",
  "akara2": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fc/Bean_cake_%28Akara%29.jpg/1280px-Bean_cake_%28Akara%29.jpg",
  "akara3": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2c/Kosai%28Akara%29.jpg/1280px-Kosai%28Akara%29.jpg",
  "pie1": "https://upload.wikimedia.org/wikipedia/commons/d/dd/Meat_pie_in_Northern_Nigeria.jpg",
  "chin1": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/A_fried_chin_chin.jpg/1280px-A_fried_chin_chin.jpg",
  "chin2": "https://upload.wikimedia.org/wikipedia/commons/6/6c/Bowl_of_fried_Chin-Chin.jpg",
  "chops1": "https://upload.wikimedia.org/wikipedia/commons/2/25/Small_chops_in_a_tray.jpg",
  "chops2": "https://upload.wikimedia.org/wikipedia/commons/b/bf/Image_of_some_small_chops_captured_in_Abuja.jpg",
  "chips1": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/PLANTAIN_CHIPS.jpg/1280px-PLANTAIN_CHIPS.jpg",
  "maize1": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/Locally_roasted_maize.jpg/1280px-Locally_roasted_maize.jpg",
  "maize2": "https://upload.wikimedia.org/wikipedia/commons/0/0b/Roasted_maize_%284126899735%29.jpg",
  "jollof1": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b8/Jollof_rice_20th_April_2025.jpg/1280px-Jollof_rice_20th_April_2025.jpg",
  "jollof2": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/Jollof_Rice_and_Meat.jpg/1280px-Jollof_Rice_and_Meat.jpg",
  "jollof3": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c9/A_Nigeria_Jollof_Rice_with_chicken.jpg/1280px-A_Nigeria_Jollof_Rice_with_chicken.jpg",
};
for (const [k, u] of Object.entries(items)) {
  try {
    execFileSync("curl", ["-fsSL", "-A", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36", "-e", "https://commons.wikimedia.org/", "-o", `tmp/cand/${k}.jpg`, u], { stdio: "pipe" });
    const size = execFileSync("stat", ["-f", "%z", `tmp/cand/${k}.jpg`], { encoding: "utf8" }).trim();
    console.log(k, "ok", size);
  } catch (e) { console.log(k, "FAIL", String(e.status)); }
  await new Promise(r => setTimeout(r, 3000));
}
