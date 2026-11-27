
## Stock sweep — place cards and hero scenes (26 Nov 2026)

Fourteen visible place cards and the three hero scenes were still on Unsplash.
Each was re-checked against Commons. Two venues had real photographs; everything
else was relabelled on the card and on its page rather than left implying that a
stock shot was the venue.

### Replaced with photographs of the venue

| Place | File (Commons thumb) | Author / licence | What it shows | Verification |
| --- | --- | --- | --- | --- |
| La Campagne Tropicana | `La_Campagne_Tropicana_Beach_Resort_002.jpg` (card), `…_001`, `…_003` | Isaacayodele32, CC BY-SA 4.0 | Aerial of the resort: long blue pool, palm groves, tennis courts, the beach; gardens; red-roofed building among thatched pavilions | All three downloaded and inspected; the layout matches La Campagne's own aerial views, and the beach/pool/tennis-court arrangement is continuous across 001 and 002 |
| Silverbird Galleria | `Silverbird_galleria,_Ahmadu_Bello_way,_Lagos.jpg` (card), `Silverbird_Galleria.jpg` | Omoeko Media, CC BY-SA 4.0; Kaizenify, CC BY-SA 4.0 | Interior atrium with chandelier and painted ceiling; the cream facade with the `galleria` sign | Both inspected; the exterior shows the sign and the Ahmadu Bello Way frontage, the interior the cinema/mall atrium |

Both are recorded in `data/photo-credits.json` with `venue: true`, so the place
card and detail page print the photographer and licence instead of an
illustrative note.

### Hero scenes — four, three of them Nigerian

| Scene | File | Author / licence | What it shows |
| --- | --- | --- | --- |
| `city` — "Welcome to Lagos" / "Discover Lagos" | Unsplash `photo-1682944856348-0665d4b8d81c` | Unsplash licence; photographer not recorded | Client's chosen opening image, restored on request at the four-scene expansion. Labelled "Illustrative stock photograph" in the hero, since the scene is unverified |
| `beach` — "Find your spot" | `Lekki_Beach_in_Lagos.jpg` | PelumiK, CC BY-SA 4.0 | Surf and open water on Lekki beach, ships on the horizon |
| `night` — "Own the night" | `Third-mainland-bridge-at-night.jpg` | S. Aderogba, CC BY-SA 4.0 | The Third Mainland Bridge lit at night above the mainland rooftops |
| `island` — "Lagos Island" | `Lagos_skyline.jpg` | Clara Sanchiz, CC BY-SA 2.0 | Lagos Island's towers seen from the approach road, marina on the right |

Each scene carries its credit string in `data/hero.ts`, rendered small at the
bottom right of the hero. The `night` scene is the city after dark rather than a
club interior: no openly licensed Lagos club photograph exists, and a bridge at
night is honest atmosphere where a picture of a foreign club would not be.

The original Unsplash "Discover Lagos" image was restored on 26 Nov 2026 by
request, and the Nigerian skyline was kept as a fourth scene (`island`) rather
than dropped — so the hero now cycles four photographs.

### Replaced, but illustrative — no venue photograph exists

Nothing reachable from this machine photographs these venues. Rather than leave a
foreign stock image unlabelled, each card and page now says so in an ember
caption under the lead image (`imageNote` in `data/places.json`):

- Quilox — official site is a JS app whose gallery never renders; no Commons photo.
- Truth Beach Club — gallery URLs 404, images served only through an expired proxy.
- NOK by Alara, Mood Lagos, Norma — no reachable press or gallery page.
- Rufus & Bee, Fun Factory — domains do not resolve.
- Dream Park & Gardens — no photograph of the park found.
- EbonyLife Cinemas, Ozone Cinemas, Purple Maryland — no venue photography.
- Ilashe Beach — one Commons result was ambiguous and could not be confirmed as Ilashe.

The wording is deliberately narrow — "Illustrative stock photograph, not Quilox —
no photograph of the club was available" — so it makes no claim about where the
stock photo was taken. The notes appear on the `/places` grid, the category and
area pages, and the place detail page.

`Club 57` also still holds Unsplash ids in `data/places.json`, but it is marked
closed and never rendered, so it was left alone.

## Campus photographs — upgrade pass (26 Nov 2026)

The first pass picked the first usable frame from each campus category, which
left three weak cards: a Senate building cropped into abstraction, an admin block
at LASUSTECH, and a vertical gate shot at LASUED. Re-checked each campus's Commons
category and search results, downloaded the candidates, and kept the best frame.

| Campus | Was | Now | Why |
| --- | --- | --- | --- |
| UNILAG | `Architectural view of the senate building…` — shot from below, lattice filling the frame | `University of Lagos Main Gate.jpg` (Ei'eke, CC BY 4.0) | The gate reads instantly and is horizontal: tower wings, crest, cars and sky. The Senate photo is still a good building but was unreadable at card size |
| Yabatech | `School of Art, Design and Printing, YabaTech.jpg` — the same subject, portrait | `…YabaTech 2.jpg` (Official alade, CC BY-SA 4.0) | Landscape frame of the same arcade, with the green course board, sculptures and students; the portrait version lost both ends to the 3:2 crop |
| LASUSTECH | `School of technology, Laspotech.jpg` — an admin block across an empty forecourt | `Lagos State University of Science and Technology (Lasutech).jpg` (Ei'eke, CC BY-SA 4.0) | The main gate with the current name on the sign, students and a car under it, 3840×2160 |
| LASUED | `LAGOS STATE UNIVERSITY OF EDUCATION, LASUED.jpg` — vertical crop of the Otedola gate | `Adeniran Ogunsanya College of Education.jpg` (Kaizenify, public domain) | The Oto/Ijanikin gate, framed whole, with the pre-merger name still on the arch — which the card copy now explains. The earlier vertical shot cropped the arch at both ends |

Rejected on inspection:

- `Main Entrance, Lagos State University of Education, Oto Ijanikin.jpg` — taken
  through a car windscreen, with reflections, a dashboard and scaffolding rods.
- `Lagos State University of Education, Epe Campus.jpg` — a phone watermark
  ("ORPO Reno8 T", date and time) burned into the bottom right.
- `Lagos state polytechnic, Ikorodu.jpg` — half the frame is a foreground tree,
  and a passer-by's face sits in the corner.
- `LASU second gate.png` / `Lagos State University Entrance.jpg` — the first is a
  screenshot-sourced PNG, the second a 2016 frame that is hazier than the current
  library-complex photograph, so LASU was left as it was.

All four new files are 1280px Commons thumbnails, credited on the card with the
photographer, licence and file-page link, the same treatment as before.

## @todolagos sweep — three more posts (26 Nov 2026)

Fetched the profile and read the ten most recent posts. Most are event flyers
(Entertainment Week Africa 2026, Mamafela Festival at Justice Mall, a Ravers
Guild night), which belong to the events calendar rather than the venue lists.
Two named venues that the guide did not carry:

| Post | Venue | Added as | Verification |
| --- | --- | --- | --- |
| Allay House introduction — spa, sauna, nails, salon, Pilates, 14 Babatunde Kuboye Street | Allay House, Lekki Phase 1 | New "Slow days" group on `/activities`, one block: "Spa and steam" | Own site `allayhouse.com` (address, Monday–Saturday 9am–7pm, Allay Spa / Pilates / Nail Studio / Salon, phone). Fresha listing at the same address for prices (sauna and steam ₦25,000/hr, Pilates reset ₦85,000, nails from ~₦5,000), read Nov 2026 |
| Ravers Guild "The Rebirth" at Skah Lagos, Lekki Phase 1 | Skah Lagos, 31A Admiralty Way | Places, category `clubs`, nights Thu–Sun | Google Maps listing (lounge bar, Plot 31A Admiralty Way, Thu–Sun 4pm–3am, Mon–Wed closed), read 5 Nov 2026; the booking pages for events at the same address confirm the venue and address |

Not added: Mamafela Festival (12 Dec, Justice Mall) and Entertainment Week Africa
(18–22 Nov) are dated events, not venues someone can turn up to in December — the
shows page is the right home for those, and it is scraped separately.

Photography, same rule as everywhere else:

- **Allay House** uses `Emotions Spa Facial Massage Parlour.jpg` (Alvinategyeka,
  CC BY-SA 4.0), a facial treatment from Wiki Loves Africa's "Health and Wellness
  in Africa" set. It is labelled illustrative because it is not Allay House and
  the file does not name the country.
- **Skah Lagos** has no photograph anywhere reachable, so it carries the
  illustrative Unsplash night scene and an `imageNote` on the card saying so.

## Per-venue photo search (second sweep, 26 Nov 2026)

The first sweep searched Commons categories; this one searched each venue by
name, and by the name it used to have. Two venues turned out to have real
photographs after all.

### Found and used

| Place | File | Author / licence | Why it is the venue |
| --- | --- | --- | --- |
| Purple Maryland | `Maryland Mall, Maryland, Lagos.jpg` (card) and `Puple Mall in Maryland Lagos State. Nigeria.jpg` (gallery) | Sho photography, CC BY-SA 4.0; Koutchika Lihouenou Gaspard, CC BY-SA 4.0 | The mall at 350–360 Ikorodu Road was **Maryland Mall** until Purple Group renamed it in 2020, so older photographs still carry the `marylandmall` sign. The daytime frame shows that sign, Genesis Cinemas and ShopRite on the LED façade; the night frame shows the same screen lit. The building matches the published description (black box, 60 m LED screen across the Ikorodu Road elevation). The card copy now says the sign still reads `marylandmall` |
| Ilashe Beach | `Africa Fishing Boat.jpg` | Gabbytoyn, CC BY-SA 4.0 | The file description places the photograph "in Ilashe, Lagos State": a fishing boat drawn up on the sand with the Atlantic behind, which is the shoreline the beach is on |

Both are marked `venue: true` in `data/photo-credits.json`, so the pages print
the photographer and licence and drop the illustrative warning.

### Searched, nothing found

Name searches on Commons and Openverse, all returning zero usable images:
Quilox, Truth Beach Club, Skah Lagos, NOK by Alara, Mood Lagos, Norma,
Rufus & Bee, Fun Factory, Dream Park, EbonyLife Cinemas, Ozone Cinemas.
Generic swaps ("Lagos nightclub", "Lagos cinema", "Lekki restaurant") return
either nothing in Lagos or unrelated results in other countries.

`clubquilox.com` was retried: it still serves a 1.7 KB JavaScript shell with a
single logo image and no venue photography, exactly as recorded on 23 November.

Those eleven cards keep the illustrative photograph and its `imageNote`
("Illustrative stock photograph, not Quilox — no photograph of the club was
available"). Club 57 was given the same note even though it is marked closed and
never rendered, so no future render can imply the stock shot is the venue.

### Hero

Four scenes: `Lekki_Beach_in_Lagos` (PelumiK), `Third-mainland-bridge-at-night`
(S. Aderogba), `Lagos_skyline` (Clara Sanchiz) and the client's restored
`Discover Lagos` Unsplash frame, which is the only stock image left in the hero
and is credited "Illustrative stock photograph". `/places` cards are the only
other place stock photography still appears.

## Market galleries (26 Nov 2026)

Only Computer Village and Mile 12 had galleries, so "enough pictures" was doing
too much work. Searched Commons by category and by name for the other five
markets, then opened every candidate.

| Market | Category / search that worked | Photos added | Files |
| --- | --- | --- | --- |
| Idumota | file search "Idumota" and "Balogun market Lagos" | 2 | `Ever-busy market.jpg` (Dotun55), `Balogun Market, Lagos Island.jpg` (Yellowcrunchy) — the card already used `IThe biggest market in West Africa, dumota Market, Lagos.jpg` (Sir Demo) |
| Yaba | file search "Yaba Lagos market", "Tejuosho market Lagos" | 2 | `MORNING MARKET.jpg` (Koyejoadejoye) — the Tejuosho end of the Yaba market, captioned as such because it is not the Yaba stalls; `2013 Yaba Lagos Nigeria 12998105744.jpg` (T. Obi), the Herbert Macaulay Way rooftops |
| Oyingbo | **Category:Oyingbo market** (the only one of the five with a category) | 3 | `Oyingbo Market, Lagos Nigeria 1.jpg` (Onikepe32), `Oyingbo Ultramodern Market.jpg` (Ei'eke), `Ponmo trader in Oyingbo Market.jpg` (Akinkunmi Akingbade) |
| Alaba | file search "Alaba market Lagos", "Alaba electronics" | 0 | Only one photograph of the market exists on Commons, `Ojo Alaba international market Lagos Electronics section.jpg` (Kosykelvin), and it is already the card image |
| Trade Fair | category and file searches, plus Openverse | 0 | No photograph of the Trade Fair Complex anywhere; the card keeps its illustrative label |

Notes on what was rejected: `Sunset at Yaba Market, Lagos.jpg` is a road at dusk
rather than a market, and `Back from market.jpg` — despite the name — is a canoe
on the lagoon at Makoko, so neither went into the Yaba gallery. The Yaba sunset
photograph stays as the card image because it is genuinely Yaba. `MORNING
MARKET.jpg` has no working thumbnail at any width (Wikimedia returns 400), so the
gallery points at the original upload.

The market page now prints a per-photo `note` under the credit, which is how the
Tejuosho caption reaches the reader.
