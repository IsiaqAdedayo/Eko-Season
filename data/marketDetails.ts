/**
 * The long-form half of a market page: what is actually sold there, how to
 * behave, and any extra photographs. The card itself lives in
 * data/activities.ts, so the two never disagree about a market's name or area.
 */

export type MarketPhoto = {
  src: string;
  alt: string;
  credit: string;
  page: string;
  note?: string;
};

export type MarketDetail = {
  intro: string;
  sells: { item: string; note: string }[];
  advice: string[];
  gettingThere: string;
  gallery: MarketPhoto[];
};

const village1 = {
  src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/79/Computer_Village%2C_Ikeja_Lagos.jpg/1280px-Computer_Village%2C_Ikeja_Lagos.jpg",
  credit: "Lightfast Media, CC BY-SA 4.0",
  page: "https://commons.wikimedia.org/wiki/File:Computer_Village,_Ikeja_Lagos.jpg",
};
const village2 = {
  src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Computer_Village%2C_Ikeja%2C_Lagos.jpg/1280px-Computer_Village%2C_Ikeja%2C_Lagos.jpg",
  credit: "Lightfast Media, CC BY-SA 4.0",
  page: "https://commons.wikimedia.org/wiki/File:Computer_Village,_Ikeja,_Lagos.jpg",
};
const mile1 = {
  src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Mile_12_market_back.jpg/1280px-Mile_12_market_back.jpg",
  credit: "Davidben zignature, CC BY-SA 4.0",
  page: "https://commons.wikimedia.org/wiki/File:Mile_12_market_back.jpg",
};
const mile2 = {
  src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/42/A_Busy_Market_in_Mile_12%2C_Lagos-_Nigeria.jpg/1280px-A_Busy_Market_in_Mile_12%2C_Lagos-_Nigeria.jpg",
  credit: "ShoT88 Studios, CC BY-SA 4.0",
  page: "https://commons.wikimedia.org/wiki/File:A_Busy_Market_in_Mile_12,_Lagos-_Nigeria.jpg",
};

export const marketDetails: Record<string, MarketDetail> = {
  idumota: {
    intro:
      "Idumota is not one market but the densest stretch of the Lagos Island trading district: fabric shops, shoe sellers, pharmacies, plastics and phone accessories packed into streets that turn into a single bazaar by mid-morning. Come with a specific list and a bag that closes.",
    sells: [
      { item: "Lace and aso-oke", note: "By the yard or by the set, for weddings and December parties. Prices run from cheap imported lace to hand-woven aso-oke." },
      { item: "Shoes and bags", note: "Rows of both, new and fairly used, mostly without sizes marked — ask before you fall for a pair." },
      { item: "Medicines and cosmetics", note: "The pharmacy wholesale end of the island: buy from a shop with a licence on the wall." },
      { item: "Household plastics", note: "Buckets, coolers, chairs, storage — the cheapest place in the city if you are furnishing a flat." },
      { item: "Watches and jewellery", note: "From ₦2,000 fashion pieces to gold, sold side by side. Know which one you are being shown." },
    ],
    advice: [
      "Go before 11am. By afternoon the aisles are a single queue.",
      "Carry your bag in front of you, and leave the second phone at home.",
      "Agree the price before anything is cut or wrapped — the cutting is where the argument starts.",
    ],
    gettingThere:
      "Off Broad Street on Lagos Island, a short walk from Marina. The CMS bus stop is the nearest drop-off; taxis will not want to go further in.",
    gallery: [
      {
        src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/39/Ever-busy_market.jpg/960px-Ever-busy_market.jpg",
        alt: "Idumota from above: a column of yellow buses and danfos nose to tail between market stalls, tower blocks in the haze behind.",
        credit: "Dotun55, CC BY-SA 4.0",
        page: "https://commons.wikimedia.org/wiki/File:Ever-busy_market.jpg",
      },
      {
        src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Balogun_Market%2C_Lagos_Island.jpg/1280px-Balogun_Market%2C_Lagos_Island.jpg",
        alt: "Corrugated roofs and clothing hung out at Balogun market, traders moving between the stalls below.",
        credit: "Yellowcrunchy, CC BY-SA 4.0",
        page: "https://commons.wikimedia.org/wiki/File:Balogun_Market,_Lagos_Island.jpg",
      },
    ],
  },
  katangua: {
    intro:
      "Katangua — locally just \"Super\", after the bus stop — is where Lagos buys second-hand clothes by the bale. Almost everything is imported okrika, sorted into grades, and the whole market runs on three days a week.",
    sells: [
      { item: "Bales of okrika", note: "The unit of trade. A sealed bale is a gamble: you buy the grade, not the contents." },
      { item: "Jeans and jackets", note: "Sorted by size and quality on the open ground once a bale is broken." },
      { item: "Shoes and bags", note: "Second-hand pairs, mostly single sizes — check both shoes before paying." },
      { item: "Children's clothing", note: "Cheap and plentiful, sold by the pile rather than the piece." },
    ],
    advice: [
      "Go on a Monday, Tuesday or Friday morning — those are market days, when new bales are opened.",
      "Bring a big bag and cash in small notes; there is no card machine in sight.",
      "Check seams, zips and soles properly. Nothing is returnable.",
    ],
    gettingThere:
      "Katangua sits on the Lagos–Abeokuta expressway at Abule Egba, beside the Super bus stop.",
    gallery: [],
  },
  yaba: {
    intro:
      "Yaba market is student Lagos: thrift and new clothes at prices set for people on a stipend, phone repairs, and street food on every corner. It is smaller than the island markets and much easier to walk.",
    sells: [
      { item: "Thrift clothing", note: "Jeans, hoodies, jackets and dresses, hung out through the day. \"Bend down select\" piles are the cheapest." },
      { item: "Sneakers", note: "New and fairly used, with the better pairs kept inside the shops rather than on the street." },
      { item: "Phone accessories", note: "Cases, chargers, screen protectors — and a repair bench every few metres." },
      { item: "Street food", note: "Suya, shawarma, akara and roasted corn, all cooked in front of you." },
    ],
    advice: [
      "Late afternoon into early evening is when every stall is open.",
      "Prices are a starting point. Walking away is the strongest negotiating move you have.",
      "Keep to the main street after dark; the side alleys are unlit.",
    ],
    gettingThere:
      "Between Tejuosho and Ojuelegba, off Herbert Macaulay Way in Yaba — walkable from the University of Lagos and Yabatech.",
    gallery: [
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/2/22/MORNING_MARKET.jpg",
        alt: "A trader nursing her baby behind tins of groundnuts and melon seeds at the morning market beside Tejuosho, in Yaba.",
        credit: "Koyejoadejoye, CC BY-SA 4.0",
        page: "https://commons.wikimedia.org/wiki/File:MORNING_MARKET.jpg",
        note: "Tejuosho, at the Yaba end of the market — not the Yaba stalls themselves",
      },
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/6/68/2013_Yaba_Lagos_Nigeria_12998105744.jpg",
        alt: "Yaba from above: Herbert Macaulay Way running past low roofs, a blue-roofed block and yellow buses.",
        credit: "T. Obi, CC BY 2.0",
        page: "https://commons.wikimedia.org/wiki/File:2013_Yaba_Lagos_Nigeria_12998105744.jpg",
      },
    ],
  },
  oyingbo: {
    intro:
      "Oyingbo is the city's fish market, rebuilt in 2015 into a multi-storey complex, and the wholesale prices set here tend to become the prices everywhere else. It opens earlier than the island markets and shuts earlier too.",
    sells: [
      { item: "Frozen fish", note: "Mackerel, croaker, titus and sardines, imported by the container and sold by the carton or the basin." },
      { item: "Smoked fish", note: "Bought for soups and stews, sold by the string or the basket." },
      { item: "Meat", note: "Beef, goat and offal, cut to order at the back of the complex." },
      { item: "Peppers and tomatoes", note: "A smaller produce section, useful if you are already here for fish." },
    ],
    advice: [
      "Come early — the fish is graded and gone by mid-morning.",
      "Bring a cooler or a cold bag, and ask for the fish to be packed with ice.",
      "Watch the scale. Ask for the weight and pay for that, not for the pile.",
    ],
    gettingThere:
      "Oyingbo, Ebute Metta — beside the Oyingbo bus terminal and the lagoon jetty, a short ride from Iddo.",
    gallery: [
      {
        src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e2/Oyingbo_Market%2C_Lagos_Nigeria_1.jpg/1280px-Oyingbo_Market%2C_Lagos_Nigeria_1.jpg",
        alt: "Baskets of oranges, watermelons and green vegetables stacked in front of a trader's stall at Oyingbo.",
        credit: "Onikepe32, CC BY-SA 4.0",
        page: "https://commons.wikimedia.org/wiki/File:Oyingbo_Market,_Lagos_Nigeria_1.jpg",
      },
      {
        src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/Oyingbo_Ultramodern_Market.jpg/1280px-Oyingbo_Ultramodern_Market.jpg",
        alt: "The Oyingbo Ultra Modern Market sign over the entrance, a porter carrying sacks of grain on his shoulder past it.",
        credit: "Ei'eke, CC BY 4.0",
        page: "https://commons.wikimedia.org/wiki/File:Oyingbo_Ultramodern_Market.jpg",
      },
      {
        src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6c/Ponmo_trader_in_Oyingbo_Market.jpg/960px-Ponmo_trader_in_Oyingbo_Market.jpg",
        alt: "A trader spreading pieces of ponmo on a mat at Oyingbo, a basket of more on a stool behind her.",
        credit: "Akinkunmi Akingbade, CC BY-SA 4.0",
        page: "https://commons.wikimedia.org/wiki/File:Ponmo_trader_in_Oyingbo_Market.jpg",
      },
    ],
  },
  "computer-village": {
    intro:
      "Computer Village is the largest technology market in the country: phones, laptops, screens, batteries and the technicians who fit them, in a grid of streets behind Ikeja. It is also where most Lagos phones get repaired, which tells you what to expect.",
    sells: [
      { item: "Phones", note: "New, fairly used and refurbished, in every price band. Ask which one you are being sold." },
      { item: "Laptops", note: "Business ex-lease machines are the value buy; check the battery health and the keyboard." },
      { item: "Screens and batteries", note: "Replaced while you wait, usually within the hour, at a bench behind the shop." },
      { item: "Accessories", note: "Chargers, cases, power banks, memory cards — the cheapest tier of the market." },
      { item: "SIM registration", note: "Operator desks are inside the market; bring the ID the operator asks for." },
    ],
    advice: [
      "Closed on Sundays. Weekday mornings are calmest.",
      "Price the same model in three shops before you commit — the spread is wide.",
      "Test everything in front of the seller: calls, camera, charging, and the IMEI on a lookup.",
      "Get the warranty in writing, with the shop's name on it.",
    ],
    gettingThere:
      "Otigba Street, off Obafemi Awolowo Way in Ikeja — the Ikeja Along bus stop is the nearest drop-off.",
    gallery: [
      { ...village1, alt: "The Tecno Digital Square building and phone-shop signage on a Computer Village street in Ikeja." },
      { ...village2, alt: "Shop fronts and advertising hoardings around Tecno Digital Square in Computer Village, Ikeja." },
    ],
  },
  "trade-fair": {
    intro:
      "Trade Fair is where shopkeepers buy, not where you browse. A vast complex on the Badagry expressway split into sections — auto parts, textiles, cosmetics, a China section — with prices that drop sharply once you take a carton.",
    sells: [
      { item: "Cosmetics and hair", note: "Wholesale cartons of skincare, hair products and wigs; the section most visitors come for." },
      { item: "Textiles", note: "Fabric by the roll or the bale, for tailors and resellers." },
      { item: "Car parts", note: "The auto section stocks everything from filters to body panels, new and used." },
      { item: "Jewellery and watches", note: "Wholesale trays, priced by the dozen rather than the piece." },
      { item: "China section", note: "Housewares, tools, packaging and party supplies, imported in bulk." },
    ],
    advice: [
      "Go on a weekday morning with a list. It is half a day minimum.",
      "Buy in cartons. Single units are priced for people who did not come to trade.",
      "Arrange a driver who will wait — getting out with goods is the hard part.",
    ],
    gettingThere:
      "Trade Fair Complex on the Badagry expressway at Ojo. The complex is huge; know which gate your section is nearest.",
    gallery: [],
  },
  "mile-12": {
    intro:
      "Mile 12 is the city's largest perishable market, restocked overnight by trailers from Plateau, Kaduna, Kano and Benue. If you are cooking for a houseful over December, this is where food is cheapest — in bulk, at dawn, with a vehicle already arranged.",
    sells: [
      { item: "Tomatoes and peppers", note: "Sold by the basket, and the basket is the unit — check the bottom layer before you agree." },
      { item: "Onions", note: "Northern onions by the bag, cheaper than any supermarket by a wide margin." },
      { item: "Yam and tubers", note: "Stacked in the open ground, sold by the tuber or by the dozen." },
      { item: "Rice and beans", note: "Grain stalls at the back of the market, priced by the bag." },
      { item: "Palm oil", note: "Sold in jerrycans, and worth buying here rather than in small bottles." },
    ],
    advice: [
      "Be there before 8am. The good produce is graded and gone by nine.",
      "Bring a vehicle and a driver who will wait — you cannot carry a basket of tomatoes on a bus.",
      "Open the basket. What is on top is not always what is underneath.",
    ],
    gettingThere:
      "Mile 12 market on Ikorodu Road, Kosofe — the Mile 12 bus stop is at the gate.",
    gallery: [
      { ...mile1, alt: "The green Mile 12 road sign above a crowd of shoppers and umbrellas at the market entrance." },
      { ...mile2, alt: "A trader carrying a tray of bread on her head past mounds of yam at Mile 12 market." },
    ],
  },
  alaba: {
    intro:
      "Alaba International is the electronics counterpart to Trade Fair: sound systems, televisions, fridges, generators and the repairers who keep them running. Cheaper than the malls and considerably more chaotic.",
    sells: [
      { item: "Televisions", note: "Every size, imported and assembled locally. Ask for the panel type and the warranty card." },
      { item: "Sound systems", note: "Speakers, amplifiers and home theatre, demonstrated loudly whether you asked or not." },
      { item: "Fridges and freezers", note: "Sold with delivery arranged; confirm the voltage rating for a generator." },
      { item: "Generators", note: "The market that powers the rest of Lagos. Ask what the shop will do if it fails in a month." },
      { item: "Spare parts and repairs", note: "Benches at the back of the shops fix what the front sold you." },
    ],
    advice: [
      "Weekday morning, and never in the rain — the streets flood and the traffic stops.",
      "Test anything electrical in the shop before it leaves, with your own plug.",
      "Bargain in cash, and ask for the receipt to carry the shop's stamp.",
    ],
    gettingThere:
      "Alaba International Market, Ojo, along the Badagry expressway — the same corridor as Trade Fair.",
    gallery: [],
  },
};

export const getMarketDetail = (id: string) => marketDetails[id];
