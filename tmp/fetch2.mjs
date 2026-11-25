import { execFileSync } from "node:child_process";
const items = {
  "egusi1": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/EGUSI_SOUP.JPG/1280px-EGUSI_SOUP.JPG",
  "egusi2": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Pot_of_Egusi_soup.jpg/1280px-Pot_of_Egusi_soup.jpg",
  "egusi3": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/Egusi_soup_in_a_plate.jpg/1280px-Egusi_soup_in_a_plate.jpg",
  "egusi4": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Egusi_soup_with_pounded_yam_and_assorted_meats.jpg",
  "suya1": "https://upload.wikimedia.org/wikipedia/commons/7/7e/Suya_in_skewers.jpg",
  "suya2": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/Suya_with_pepper_sauce.jpg/1280px-Suya_with_pepper_sauce.jpg",
  "suya3": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/SuyavarietiesTX.JPG/1280px-SuyavarietiesTX.JPG",
  "amala1": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Ewedu_and_Amala_meal.jpg/1280px-Ewedu_and_Amala_meal.jpg",
  "amala2": "https://upload.wikimedia.org/wikipedia/commons/1/1b/Amala_and_Gbegiri_with_Ewedu_soup.jpg",
  "amala3": "https://upload.wikimedia.org/wikipedia/commons/3/37/Amala_with_special_soup_combination.jpg",
};
for (const [k, u] of Object.entries(items)) {
  try {
    execFileSync("curl", ["-fsSL", "-A", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36", "-e", "https://commons.wikimedia.org/", "-o", `tmp/cand/${k}.jpg`, u], { stdio: "pipe" });
    console.log(k, "ok");
  } catch (e) { console.log(k, "FAIL", String(e.status)); }
  await new Promise(r => setTimeout(r, 3000));
}
