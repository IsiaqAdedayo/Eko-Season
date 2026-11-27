/**
 * Everything you can *do* in Lagos, as opposed to where you can sit.
 *
 * Same rule as data/places.json: an entry only goes in when a venue publishes
 * where it is, and anything we could not confirm is written as such rather
 * than guessed. Hours and prices move, so each block carries the date it was
 * read and the page says so once at the bottom.
 */

export type ActivityVenue = {
  name: string;
  area: string;
  note: string;
  /** Only where a venue publishes it. A tier otherwise. */
  price?: string;
  address?: string;
  url?: string;
};

export type Activity = {
  id: string;
  title: string;
  blurb: string;
  bestFor: string;
  /** Rough spend, same scale as places: ₦ to ₦₦₦₦. Absent when nothing is bookable. */
  price?: string;
  image: string;
  imageAlt: string;
  imageCredit: string;
  imagePage: string;
  /**
   * Set when the photograph is not of this activity in Nigeria. The card prints
   * it under the image so a foreign stock shot is never passed off as Lagos.
   */
  imageNote?: string;
  venues: ActivityVenue[];
  /** Shown when there is no confirmed venue to list. */
  note?: string;
};

export type FootballClub = {
  /** Matches the page in data/clubs.ts. */
  id: string;
  name: string;
  league: string;
  ground: string;
  note: string;
  url?: string;
};

export type Market = {
  id: string;
  name: string;
  area: string;
  knownFor: string;
  note: string;
  bestTime: string;
  image: string;
  imageAlt: string;
  imageCredit: string;
  imagePage: string;
  /**
   * Set when the photograph is not of this market. The card prints it under
   * the image, so a reader is never shown a stock scene as if it were the
   * place they are about to walk into.
   */
  imageNote?: string;
};

export type NewcomerStep = {
  title: string;
  note: string;
  href?: string;
  hrefLabel?: string;
};

/** The date every venue below was last read. */
export const ACTIVITIES_CHECKED = "2026-11-26";

export const activities: Activity[] = [
  {
    id: "karting",
    title: "Go-karting",
    blurb:
      "Karting in Lagos is thinner than the round-ups suggest: the track that used to sit on Oniru Road (GET Arena) is marked permanently closed on its own listings. The option we could confirm is a day trip out along the Lekki–Epe corridor rather than an evening in town.",
    bestFor: "Groups, teenagers, anyone who wants an afternoon out of the traffic",
    price: "₦₦",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/Go_kart_racing_%286239255960%29.jpg/1280px-Go_kart_racing_%286239255960%29.jpg",
    imageAlt: "A kart cornering on an outdoor race track.",
    imageCredit: "Genevieve, CC BY 2.0",
    imagePage: "https://commons.wikimedia.org/wiki/File:Go_kart_racing_(6239255960).jpg",
    imageNote: "Illustrative: a kart race outside Nigeria — no Lagos track photograph available",
    venues: [
      {
        name: "Omu Resort",
        area: "Ibeju-Lekki",
        note: "No. 1 Asiwaju Bola Tinubu Way. A kart track inside a bigger resort with a water park, quad bikes and a small zoo — so it fills a whole afternoon. Confirm the kart track is running when you book; resort attractions rotate.",
        address: "Omu Resort, 1 Asiwaju Bola Tinubu Way, Ibeju-Lekki, Lagos",
        url: "https://omuresort.com/",
      },
    ],
  },
  {
    id: "paintball",
    title: "Paintball",
    blurb:
      "A walled speedball arena rather than a forest: a few rounds of ducking behind inflatable bunkers, done in under an hour. Packages are priced by pellet count, so a cautious group runs out of ammunition before it runs out of money.",
    bestFor: "Groups of six or more, birthdays, anyone who wants to run",
    price: "₦₦",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/Arena_3x3_paintball.jpg/1280px-Arena_3x3_paintball.jpg",
    imageAlt:
      "A paintball player in a full mask and padded jersey aiming a marker past a bunker.",
    imageCredit: "Andrés Aguiluz Rios, CC BY 2.0",
    imagePage: "https://commons.wikimedia.org/wiki/File:Arena_3x3_paintball.jpg",
    imageNote: "Illustrative: a paintball player outside Nigeria",
    venues: [
      {
        name: "Seal Team Paintball",
        area: "Oniru",
        note: "Trinity Avenue, inside ATV World on the Oniru side of Victoria Island. A walled speedball arena with packages priced by pellets; the branded package adds a lap of the ATV track. Tuesday to Sunday, 11am–8pm, closed Mondays — book a group ahead rather than turning up.",
        price: "Listed from about ₦8,500 a player for 25 pellets",
        address: "Trinity Ave, ATV World, Oniru, Lagos",
        url: "https://sealteampaintball.com/",
      },
    ],
  },
  {
    id: "archery",
    title: "Archery",
    blurb:
      "Three ranges, all of them set up for beginners and all of them indoors or shaded — which makes archery one of the few things in this guide that rain cannot cancel.",
    bestFor: "Dates, small groups, a quiet hour away from noise",
    price: "₦₦",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/20ft_target_at_Archery_Range%2C_Paradise_PFA.jpg/1280px-20ft_target_at_Archery_Range%2C_Paradise_PFA.jpg",
    imageAlt: "A round archery target on its stand at a shooting range.",
    imageCredit: "Michael Rivera, CC BY-SA 4.0",
    imagePage:
      "https://commons.wikimedia.org/wiki/File:20ft_target_at_Archery_Range,_Paradise_PFA.jpg",
    imageNote: "Illustrative: an archery range outside Nigeria",
    venues: [
      {
        name: "Lekki Archers Club",
        area: "Lekki Phase 1",
        note: "Christ Avenue. Weekends only — Saturday 10am–2pm, Sunday 12–4pm — so it is the one to plan a Saturday around.",
        address: "Christ Ave, Lekki Phase 1, Lagos",
      },
      {
        name: "Zen Archery",
        area: "Surulere",
        note: "Teslim Balogun Street, inside the stadium complex. Tuesday to Sunday, 10am–6pm, closed Mondays. Sessions come with a bow, arrows and a coach; expect about ₦15,000 for an hour.",
        price: "About ₦15,000 an hour with coaching",
        address: "Teslim Balogun St, Surulere, Lagos",
      },
      {
        name: "Arrowsden Archery",
        area: "Maroko",
        note: "Water Corporation Drive. Open daily until 8pm, later on weekends, and the easiest one to reach from Victoria Island or Lekki.",
        address: "Water Corporation Dr, Maroko, Lagos",
      },
    ],
  },
  {
    id: "axe-throwing",
    title: "Axe throwing",
    blurb:
      "Every round-up of Lagos activities includes axe throwing. We could not confirm a venue taking bookings, so this one stays empty rather than sending you to a locked gate.",
    bestFor: "Groups who want something competitive",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/Axe_throwing_at_the_Cavalluna_Kids_Show_01.jpg/1280px-Axe_throwing_at_the_Cavalluna_Kids_Show_01.jpg",
    imageAlt: "A person mid-throw with a hatchet at a wooden target.",
    imageCredit: "Kritzolina, CC BY-SA 4.0",
    imagePage:
      "https://commons.wikimedia.org/wiki/File:Axe_throwing_at_the_Cavalluna_Kids_Show_01.jpg",
    imageNote: "Illustrative: axe throwing outside Nigeria — there is no Lagos venue to photograph",
    venues: [],
    note: "Checked 26 November 2026: no axe-throwing venue in Lagos could be confirmed as taking bookings. The closest confirmed target sports are archery and paintball, both above. If you know a place that is running, send it in — the report link in the footer reaches us directly.",
  },
  {
    id: "arcade-and-bowling",
    title: "Arcade, pool and bowling",
    blurb:
      "Lagos has few bowling alleys and a lot of game bars: a day fee or a table buys the run of twenty-odd games, and the bar does the rest. Both of these are outdoors or on a roof, so they work as evening plans rather than midday ones.",
    bestFor: "Mixed groups, birthdays that need a bar, a rainy-hour Plan B",
    price: "₦₦",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/American_Classic_Arcade_Museum_Interior.jpg/1280px-American_Classic_Arcade_Museum_Interior.jpg",
    imageAlt:
      "A long aisle of lit arcade cabinets, with driving games in the foreground.",
    imageCredit: "Funspotarcade, CC BY-SA 4.0",
    imagePage:
      "https://commons.wikimedia.org/wiki/File:American_Classic_Arcade_Museum_Interior.jpg",
    imageNote: "Illustrative: an arcade outside Nigeria",
    venues: [
      {
        name: "Gameland Lagos",
        area: "Lekki Phase 1",
        note: "Plot 14, Providence Street, off Admiralty Way, inside The Lekki Coliseum. An outdoor games ground with more than twenty things to play — pool tables, mini-golf, archery, giant Jenga — plus a bar and small chops. Open noon to midnight daily; the day fee is listed at about ₦5,000.",
        price: "About ₦5,000 for the day",
        address: "Plot 14 Providence St, off Admiralty Way, Lekki Phase 1, Lagos",
        url: "https://gamelandlagos.com/",
      },
      {
        name: "Base24 Rooftop",
        area: "Lekki Phase 1",
        note: "41 Providence Street, Penny Mall, near the Marwa bus stop. A rooftop lounge with bowling, snooker, a boxing machine and card games, open Tuesday to Sunday into the small hours. It is a bar first: come for the games, stay for the food.",
        address: "41 Providence St, Penny Mall, Lekki Phase 1, Lagos",
      },
    ],
  },
  {
    id: "paint-and-sip",
    title: "Paint and sip",
    blurb:
      "The default group activity in Lagos for a reason: no skill needed, drinks included, and you leave with something to carry home. Studios run walk-in sessions most days and private ones for birthdays.",
    bestFor: "Birthdays, team outings, mixed groups where not everyone drinks",
    price: "₦₦",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2e/A_man_painting.jpg/1280px-A_man_painting.jpg",
    imageAlt: "A painter working on a canvas laid on the ground, with pots of colour beside him.",
    imageCredit: "Fawaz244, CC BY-SA 4.0",
    imagePage: "https://commons.wikimedia.org/wiki/File:A_man_painting.jpg",
    imageNote: "Illustrative: a Nigerian painter, not one of these studios",
    venues: [
      {
        name: "Sip and Paint .NG",
        area: "Victoria Island",
        note: "32 Musa Yar'Adua Street, inside Alali. The original Lagos paint-and-sip brand, open every day 8am–10pm, with venues across Lekki, Ikoyi and Ikeja too.",
        address: "32 Musa Yar'Adua St, Victoria Island, Lagos",
        url: "https://sipandpaint.ng/",
      },
      {
        name: "CeraCerni's Art Hub",
        area: "Lekki Phase 1",
        note: "65B Akintunde Adeyemi Drive. Nine different things to make — canvas, pottery wheel, rug tufting — plus a café. Monday to Saturday 11am–9pm, Sunday from 1pm.",
        address: "65B Akintunde Adeyemi Dr, Lekki Phase 1, Lagos",
        url: "https://ceracerniarthub.com/",
      },
      {
        name: "ArtForFun by CraftsVillage",
        area: "Surulere",
        note: "A mainland studio doing canvas, tote bags and pottery, Tuesday to Sunday 11am–7pm. Walk-ins are fine, but book ahead for four or more.",
        address: "Surulere, Lagos",
        url: "https://artforfun.com.ng/services/sip-and-paint",
      },
    ],
  },
  {
    id: "pottery",
    title: "Pottery",
    blurb:
      "A wheel, a lump of clay and two hours: the studios teach hand-building or throwing in one session and fire the piece for you to collect. It is the quietest thing on this page, which in December is the point.",
    bestFor: "Dates, a slow afternoon, anyone who wants to make something with their hands",
    price: "₦₦",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/25/A_potter_sculpting_a_clay_bowl.jpg/1280px-A_potter_sculpting_a_clay_bowl.jpg",
    imageAlt:
      "Clay-covered hands shaping the rim of a bowl on a spinning potter's wheel.",
    imageCredit: "Ayorinde Ogundele, CC BY-SA 4.0",
    imagePage:
      "https://commons.wikimedia.org/wiki/File:A_potter_sculpting_a_clay_bowl.jpg",
    imageNote: "Illustrative: a Nigerian potter at the wheel, not this studio",
    venues: [
      {
        name: "Clay of Lagos",
        area: "Victoria Island",
        note: "285 Akin Olugbade Street. A ceramics studio that sells its own tableware and runs booked workshops — hand-building, surface carving and wheel work, no experience needed. Monday to Thursday 9am–5pm, Friday to Sunday noon–10pm. Book online; the sessions are small and the walk-in space is not guaranteed.",
        address: "285 Akin Olugbade St, Victoria Island, Lagos",
        url: "https://clayoflagos.com/workshops",
      },
    ],
  },
  {
    id: "sparring",
    title: "Boxing and sparring",
    blurb:
      "A few gyms in Lagos run open sparring sessions where a visitor can turn up, get wrapped and get in the ring under a coach. Bring your own gumshield; everything else is usually available.",
    bestFor: "Anyone who trains at home and wants rounds with new people",
    price: "₦₦",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c8/Boxing_session.jpg/1280px-Boxing_session.jpg",
    imageAlt: "Two boxers sparring under a covered walkway, one holding pads for the other.",
    imageCredit: "Adewuyi Israel, CC BY-SA 4.0",
    imagePage: "https://commons.wikimedia.org/wiki/File:Boxing_session.jpg",
    imageNote: "Illustrative: a Nigerian sparring session, not one of these gyms",
    venues: [
      {
        name: "EliteBox Fitness",
        area: "Victoria Island",
        note: "Adeyemo Alakija Street, a short walk from Adeola Odeku. Boutique boxing gym with classes, self-defence and a Saturday sparring session that draws a crowd of white-collar boxers and competitors.",
        address: "20 Adeyemo Alakija St, Victoria Island, Lagos",
        url: "https://eliteboxng.com/sign-up",
      },
      {
        name: "Glix Boxing Club",
        area: "Ikeja",
        note: "530 Lateef Jakande Road, Agidingbi. Open-air ring on the mainland; Tuesday and Thursday evenings plus a longer Saturday morning session with controlled sparring for intermediate and advanced boxers.",
        address: "530 Lateef Jakande Rd, Agidingbi, Ikeja, Lagos",
        url: "https://glixfitness.com/",
      },
      {
        name: "RRG Boxing Club",
        area: "Lekki Phase 1",
        note: "Admiralty Way. Open daily from 6am until 10pm, which makes it the easiest one to fit around a work day.",
        address: "Admiralty Way, Lekki Phase 1, Lagos",
      },
    ],
  },
  {
    id: "padel",
    title: "Padel",
    blurb:
      "Padel arrived in Lagos a few years ago and now has a cluster of clubs between Ikoyi and Victoria Island. Courts are floodlit, most rent rackets, and the clubs run matchmaking if you are short of a fourth — so you can turn up empty-handed.",
    bestFor: "Four people, after work, mixed ability",
    price: "₦₦₦",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8a/Padel_court_Nsambya.jpg/1280px-Padel_court_Nsambya.jpg",
    imageAlt: "A glass-walled padel court with its blue surface and net.",
    imageCredit: "Samson Ssemakadde, CC0",
    imagePage: "https://commons.wikimedia.org/wiki/File:Padel_court_Nsambya.jpg",
    imageNote: "Illustrative: a padel court outside Nigeria — no Lagos court photograph available",
    venues: [
      {
        name: "PadelX",
        area: "Ikoyi",
        note: "23AA Cooper Road. Four courts, clubhouse and café, open 6am–11pm every day. Book on their app; peak evening slots go first.",
        address: "23AA Cooper Rd, Ikoyi, Lagos",
        url: "https://padelx-ng.com/",
      },
      {
        name: "The Padel Club",
        area: "Ikoyi",
        note: "57 Glover Road. Open 6am to midnight, with coaching and a matchmaking board if you are short of a fourth.",
        address: "57 Glover Rd, Ikoyi, Lagos",
      },
      {
        name: "The Padel House",
        area: "Ikoyi",
        note: "41 Ribadu Road. Indoor courts, which matters in a Lagos downpour, plus a café and pro shop. Open daily until midnight.",
        address: "41 Ribadu Rd, Ikoyi, Lagos",
      },
      {
        name: "Magic Padel",
        area: "Victoria Island",
        note: "Behind the Federal Palace Hotel on Ahmadu Bello Way. Courts, coaches and a café; book in advance through their app.",
        address: "Federal Palace Hotel, 6-8 Ahmadu Bello Way, Victoria Island, Lagos",
      },
    ],
  },
  {
    id: "five-a-side",
    title: "Five-a-side football",
    blurb:
      "Astroturf pitches are booked by the hour and mostly play at night under floodlights. A slot is usually split between ten people, so the per-head cost is lower than it looks.",
    bestFor: "Ten friends, a work team, anyone who wants a game at 8pm",
    price: "₦₦",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/96/An_Ariel_View_of_the_football_pitch_of_Yaba_College_of_Technology_in_the_morning.jpg/1280px-An_Ariel_View_of_the_football_pitch_of_Yaba_College_of_Technology_in_the_morning.jpg",
    imageAlt: "A football pitch at a Lagos college seen from above at sunrise, with the running track around it.",
    imageCredit: "Johnbrainyvisuals, CC BY-SA 4.0",
    imagePage:
      "https://commons.wikimedia.org/wiki/File:An_Ariel_View_of_the_football_pitch_of_Yaba_College_of_Technology_in_the_morning.jpg",
    imageNote: "Illustrative: a Lagos football pitch, not one of these venues",
    venues: [
      {
        name: "Funturf",
        area: "Lekki Phase 1",
        note: "10 Lai Yusuf Crescent, off Admiralty Way. Four pitches, changing rooms with showers, floodlights and a spectators' pavilion. The island's most established booking.",
        address: "10 Lai Yusuf Cres, Lekki Phase 1, Lagos",
        url: "https://funturf.ng/about",
      },
      {
        name: "The Yard, Lekki",
        area: "Lekki Phase 1",
        note: "Five- and seven-a-side astroturf with floodlights, showers and parking. Listed from about ₦30,000 an hour for five-a-side.",
        price: "From about ₦30,000 an hour",
        address: "Lekki Phase 1, Lagos",
        url: "https://www.playtempo11.com/",
      },
      {
        name: "Paradise Park Arena",
        area: "Ikoyi",
        note: "Five-a-side under lights on the island, listed from about ₦40,000 an hour. The convenient one if you are staying in Ikoyi or Victoria Island.",
        price: "From about ₦40,000 an hour",
        address: "Ikoyi, Lagos",
        url: "https://www.playtempo11.com/",
      },
      {
        name: "HabbyFx Sports Centre",
        area: "Akoka, Yaba",
        note: "50 Afolabi Brown Street. Floodlit five-a-side plus an outdoor gym and snooker lounge — the mainland answer to Funturf, and close to UNILAG.",
        address: "50 Afolabi Brown St, Akoka, Yaba, Lagos",
      },
      {
        name: "PlayGround by LSP",
        area: "Lekki",
        note: "39 Kusenla Road. One complex with football, padel, basketball, archery and paintball, open 6am to midnight — useful when the group cannot agree on a sport.",
        address: "39 Kusenla Rd, Lekki, Lagos",
      },
    ],
  },
  {
    id: "basketball",
    title: "Basketball",
    blurb:
      "Pickup runs most evenings on the outdoor courts, and the state-owned mini stadiums rent courts by the hour. Bring a ball; finding a game is rarely the hard part.",
    bestFor: "Pickup games, a shooting session, groups of six",
    price: "₦",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d1/Ilupeju_Junior_Grammar_School_Basketball_Court_05.jpg/1280px-Ilupeju_Junior_Grammar_School_Basketball_Court_05.jpg",
    imageAlt: "An outdoor basketball court in Lagos with its painted key and hoops.",
    imageCredit: "ReoMartins, CC BY-SA 4.0",
    imagePage:
      "https://commons.wikimedia.org/wiki/File:Ilupeju_Junior_Grammar_School_Basketball_Court_05.jpg",
    imageNote: "Illustrative: a Lagos court, not one of these venues",
    venues: [
      {
        name: "PlayGround by LSP",
        area: "Lekki",
        note: "Kusenla Road. Booked courts alongside the football pitches; the most reliable way to guarantee a hoop on a weekend.",
        address: "39 Kusenla Rd, Lekki, Lagos",
      },
      {
        name: "Abesan Mini Stadium",
        area: "Ipaja",
        note: "Jakande Low-Cost Housing Estate, Mosan-Okunola. A Lagos State Sports Commission facility with a basketball court, volleyball court and open field available for hire — mainland, cheap, and busy in the evenings.",
        address: "Abesan Mini Stadium, Iyana Ipaja, Lagos",
        url: "https://facilities.lssc.lg.gov.ng/book-our-facility",
      },
    ],
  },
  {
    id: "tennis",
    title: "Tennis",
    blurb:
      "Mostly club tennis: a public-friendly club on the mainland, the old island clubs on clay, and a hotel court you can pay for by the hour. The island clubs are members' clubs, so a phone call comes before a racket bag.",
    bestFor: "Two players, an early morning before the heat, anyone who packed a racket",
    price: "₦₦",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/16/Lawn_tennis_training_session_at_unilorin_1.jpg/1280px-Lawn_tennis_training_session_at_unilorin_1.jpg",
    imageAlt:
      "A tennis player in a pink shirt hitting a shot on a floodlit hard court in Nigeria.",
    imageCredit: "Godstime Elijah, CC BY-SA 4.0",
    imagePage:
      "https://commons.wikimedia.org/wiki/File:Lawn_tennis_training_session_at_unilorin_1.jpg",
    imageNote: "Illustrative: a Nigerian tennis session, not one of these clubs",
    venues: [
      {
        name: "Mainland Tennis Club",
        area: "Surulere",
        note: "Inside the National Stadium complex. Seven courts: three for members, a centre court and three back courts open to the general public, with coaches you can pay per session. Open 6am–8pm every day, which makes it the easiest game in the city to get.",
        address: "National Stadium, Surulere, Lagos",
      },
      {
        name: "Lagos Lawn Tennis Club",
        area: "Lagos Island",
        note: "12 Tafawa Balewa Road, Onikan. The oldest tennis club in the country, with eight courts and a central court, and host of the Lagos Open. It is a members' club — ask about a day pass or coming as a guest before you turn up with a bag.",
        address: "12 Tafawa Balewa Rd, Onikan, Lagos Island, Lagos",
      },
      {
        name: "Eko Hotels tennis court",
        area: "Victoria Island",
        note: "The hotel's floodlit court is open to outside guests for a published guest fee, 7am–9pm daily, with lessons at extra cost. The most straightforward court to book on the island if you are not a member anywhere.",
        price: "About ₦10,000 an hour for outside guests",
        address: "Plot 1415 Adetokunbo Ademola St, Victoria Island, Lagos",
        url: "https://www.ekohotels.com/lawn-tennis-court.php",
      },
    ],
  },
  {
    id: "golf",
    title: "Golf",
    blurb:
      "Three courses worth knowing: the championship 18 out past Lekki, the 1938 course in Ikoyi and a tight par 69 in the middle of Ikeja. All three are clubs, so ask about visitor play — and about any handicap requirement — before you travel.",
    bestFor: "A full morning, a caddie, a round booked before you land",
    price: "₦₦₦₦",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f4/Green_and_Fairway_on_Wilpshire_Golf_Course_-_geograph.org.uk_-_5470495.jpg/1280px-Green_and_Fairway_on_Wilpshire_Golf_Course_-_geograph.org.uk_-_5470495.jpg",
    imageAlt: "A flagged green with a bunker and fairway beyond it on a tree-lined course.",
    imageCredit: "Chris Heaton, CC BY-SA 2.0",
    imagePage:
      "https://commons.wikimedia.org/wiki/File:Green_and_Fairway_on_Wilpshire_Golf_Course_-_geograph.org.uk_-_5470495.jpg",
    imageNote: "Illustrative: a golf course outside Nigeria — no usable Lagos course photograph available",
    venues: [
      {
        name: "Lakowe Lakes Golf & Country Estate",
        area: "Ibeju-Lekki",
        note: "An 18-hole, par-72 championship course plus a nine-hole mashie course and a driving range, inside a resort with cottages, a pool and a tennis court. The one course here built for a visitor staying a night or two.",
        address: "Lakowe Lakes, Ibeju-Lekki, Lagos",
        url: "https://lakowelakes.com/",
      },
      {
        name: "Ikoyi Club 1938 Golf Course",
        area: "Ikoyi",
        note: "Eighteen holes, par 71, 6,384 yards from the white tees, at 6 Ikoyi Club Road. Founded in 1938 and still the most central round in the city — a member has to sign you in.",
        address: "6 Ikoyi Club 1938 Rd, Ikoyi, Lagos",
        url: "https://ikoyiclub1938.org/",
      },
      {
        name: "Ikeja Golf Club",
        area: "Ikeja GRA",
        note: "1 Works Road, off Oba Akinjobi Way. Par 69 and 5,272 yards: short, tree-lined and unforgiving of a wayward drive, with two practice areas, caddies and club rental. Open Monday to Saturday, closed Sundays.",
        address: "1 Works Rd, off Oba Akinjobi Way, Ikeja GRA, Lagos",
        url: "https://ikejagolfclub.org.ng/",
      },
    ],
  },
  {
    id: "table-tennis",
    title: "Table tennis",
    blurb:
      "The cheapest sport on this page and the easiest to find: a specialist club at Teslim Balogun, a public hall at Rowe Park, a board in an Ikeja park and a sports bar with tables in GRA.",
    bestFor: "An hour indoors, two to four people, no booking marathon",
    price: "₦",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/Students_playing_table_tennis_at_University_of_Nigeria%2C_Nsukka_stadium.jpg/1280px-Students_playing_table_tennis_at_University_of_Nigeria%2C_Nsukka_stadium.jpg",
    imageAlt:
      "Two players mid-rally at an outdoor table tennis table in a Nigerian stadium, watched by onlookers.",
    imageCredit: "Ebuka20, CC BY-SA 4.0",
    imagePage:
      "https://commons.wikimedia.org/wiki/File:Students_playing_table_tennis_at_University_of_Nigeria,_Nsukka_stadium.jpg",
    imageNote: "Illustrative: Nigerian players, not one of these halls",
    venues: [
      {
        name: "Ozone Table Tennis Club",
        area: "Surulere",
        note: "In the facility building at Teslim Balogun Stadium, Shitta. A dedicated table tennis club with coaching from first serve to competition level. Monday to Friday 10am–6pm, Saturday until 8pm, Sunday 11am–5pm.",
        address: "Teslim Balogun Stadium, Shitta, Surulere, Lagos",
      },
      {
        name: "Rowe Park table tennis hall",
        area: "Yaba",
        note: "208 Herbert Macaulay Way. A public hall with about seven tables, lit and open through the week, roughly 8am–7pm. Bring a bat if you have one; the hall is the table, not the equipment.",
        address: "Rowe Park Sports Centre, 208 Herbert Macaulay Way, Yaba, Lagos",
      },
      {
        name: "Ndubuisi Kanu Park",
        area: "Ikeja",
        note: "Mobolaji Johnson Avenue, Oregun. A public park with a table tennis board and a lawn, charged by the hour with a small gate fee and no membership — the cheapest game on this page.",
        price: "About ₦2,000 an hour, plus the gate fee",
        address: "Ndubuisi Kanu Park, Mobolaji Johnson Ave, Oregun, Ikeja, Lagos",
      },
      {
        name: "Tap Table Tennis",
        area: "Ikeja GRA",
        note: "11b Isaac John Street. A sports bar with table tennis and snooker, open Tuesday to Sunday from 11am until late — the evening option rather than the training one.",
        address: "11b Isaac John St, Ikeja GRA, Lagos",
      },
    ],
  },
  {
    id: "swimming",
    title: "Swimming",
    blurb:
      "Two public pools with lanes and lifeguards on the mainland, plus a hotel pool on the island that sells a day pass. Worth knowing before a hot afternoon: the hotel pass is the comfortable one, the stadium pool is the proper one.",
    bestFor: "Laps, a hot afternoon, families with children",
    price: "₦₦",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Swimming_Pool_In_National_Stadium_Lagos.jpg/1280px-Swimming_Pool_In_National_Stadium_Lagos.jpg",
    imageAlt: "Lanes and starting blocks at the National Stadium swimming pool in Lagos.",
    imageCredit: "Kojoclicks, CC BY-SA 4.0",
    imagePage:
      "https://commons.wikimedia.org/wiki/File:Swimming_Pool_In_National_Stadium_Lagos.jpg",
    venues: [
      {
        name: "Olympic Swimming Pool",
        area: "Surulere",
        note: "The 50-metre pool at the Achwac aquatic complex in the National Stadium, open daily from 8am, with coaches on site. Entry is charged per swim and the figure moves — recent visitors report anything from ₦2,000 to ₦5,000 for adults — so ask at the gate rather than trusting a price online.",
        price: "Pay per swim; about ₦2,000–5,000 in recent reviews",
        address: "Achwac Aquatic Complex, National Stadium, Surulere, Lagos",
      },
      {
        name: "Police College Swimming Pool",
        area: "Ikeja GRA",
        note: "A large public pool — 4ft at the shallow end, 16ft at the deep end — with lifeguards on duty and changing rooms, open 8am–6pm every day. The mainland option if you are staying in Ikeja.",
        address: "Police College, Ikeja GRA, Lagos",
      },
      {
        name: "Eko Hotels pool day pass",
        area: "Victoria Island",
        note: "Outside guests can buy a day package that includes the pool and a buffet meal; children pay roughly half. Expensive, but it is a published day pass rather than a favour, and it is the easiest pool to reach from Victoria Island.",
        price: "About ₦55,000–60,000 per adult, buffet included",
        address: "Plot 1415 Adetokunbo Ademola St, Victoria Island, Lagos",
        url: "https://www.ekohotels.com/swimming-pool.php",
      },
    ],
  },
  {
    id: "water-park",
    title: "Water parks",
    blurb:
      "Two options within reach of Lekki: a purpose-built park in Sangotedo and the splash zone inside Omu Resort. Both are whole-afternoon outings built for families, and both are better booked before you travel than queued for at the gate.",
    bestFor: "Families, a full day, anyone who wants to be in water by 10am",
    price: "₦₦₦",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/32/Kenwood_Cove%2C_Salina%2C_Kansas%2C_June_17%2C_2017.jpg/1280px-Kenwood_Cove%2C_Salina%2C_Kansas%2C_June_17%2C_2017.jpg",
    imageAlt:
      "A busy outdoor water park: a tall slide tower, a shallow pool full of swimmers and sun shades over the deck.",
    imageCredit: "Smuckola, CC BY-SA 4.0",
    imagePage:
      "https://commons.wikimedia.org/wiki/File:Kenwood_Cove,_Salina,_Kansas,_June_17,_2017.jpg",
    imageNote: "Illustrative: a water park outside Nigeria — no photograph of Giwa Gardens on Commons",
    venues: [
      {
        name: "Giwa Gardens",
        area: "Sangotedo",
        note: "Monastery Way, Sangotedo, off the Lekki–Epe corridor. A wave pool, a multi-level waterhouse, high-speed slides and a lazy river, open 10am–8pm daily. Tickets are sold by tier online and the park's own site says booking ahead is cheaper; outside food and drink are not allowed in.",
        address: "Giwa Gardens, Monastery Way, Sangotedo, Lekki, Lagos",
        url: "https://giwagardens.com/",
      },
      {
        name: "Omu Resort Splash Zone",
        area: "Ibeju-Lekki",
        note: "The water park inside Omu Resort on the Lekki–Epe corridor — the same trip as the karts and the zoo, so it fills one long afternoon rather than two outings. Confirm which rides are running when you book; resort attractions rotate.",
        address: "Omu Resort, 1 Asiwaju Bola Tinubu Way, Ibeju-Lekki, Lagos",
        url: "https://omuresort.com/",
      },
    ],
  },
  {
    id: "spa-day",
    title: "Spa and steam",
    blurb:
      "Beauty, wellness and movement in one building rather than one appointment: a hammam and massage rooms, a Pilates studio, a nail studio and a salon. Treatments and classes run on different calendars, so book both before you go, and pick a weekday morning if you want the quiet.",
    bestFor: "The morning after, couples, anyone who wants a quiet indoor day",
    price: "₦₦₦",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/Emotions_Spa_Facial_Massage_Parlour.jpg/1280px-Emotions_Spa_Facial_Massage_Parlour.jpg",
    imageAlt:
      "A therapist in a white uniform holding a facial steamer over a client lying on a treatment bed.",
    imageCredit: "Alvinategyeka, CC BY-SA 4.0",
    imagePage:
      "https://commons.wikimedia.org/wiki/File:Emotions_Spa_Facial_Massage_Parlour.jpg",
    imageNote:
      "Illustrative: a facial treatment in Africa, not Allay House — the file does not name the country",
    venues: [
      {
        name: "Allay House",
        area: "Lekki Phase 1",
        note: "14 Babatunde Kuboye Street. Four things under one roof: Allay Spa (head spa, massage, hammam, facials), Allay Pilates, a nail studio and a salon. Open Monday to Saturday, 9am–7pm, and closed Sunday on the venue's own site. Its Fresha booking page listed sauna and steam at ₦25,000 an hour, a Pilates reset at ₦85,000 and nails from about ₦5,000 when it was read in November 2026 — check the calendar, because slots and prices move.",
        address: "14 Babatunde Kuboye Street, Lekki Phase 1, Lagos",
        url: "https://www.allayhouse.com/",
      },
    ],
  },
  {
    id: "laygos-watercrafts",
    title: "Jet skiing and boat rides on the lagoon",
    blurb:
      "Laygos Watercrafts is a lagoon-side operator on Ozumba Mbadiwe Avenue, Victoria Island, with jet ski rides and boat cruises as the two main things. It is one of the easier water-sport pickups on the Island: you do not have to commit to a whole beach day to do a quick ride, and the lagoon side is calmer than the open ocean side.",
    bestFor: "A quick adrenaline hit, date riders, anyone who wants waves without a full beach day",
    price: "₦₦",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4e/Jet_ski_02.jpg/1280px-Jet_ski_02.jpg",
    imageAlt:
      "A jet ski on open water, rider facing forward with a life jacket.",
    imageCredit: "Bagheera, CC BY-SA 3.0",
    imagePage: "https://commons.wikimedia.org/wiki/File:Jet_ski_02.jpg",
    imageNote: "Illustrative: a jet ski outside Nigeria — no photograph of Laygos Watercrafts itself was available from the reachable sources checked",
    venues: [
      {
        name: "Laygos Watercrafts",
        area: "Victoria Island",
        note: "17a Ozumba Mbadiwe Avenue, Victoria Island. Jet ski rides and boat cruises on the lagoon, with WhatsApp booking from the office line. Daytime through early evening; weekends and afternoons are the busiest when the water is calmest.",
        price: "Jet ski rides listed from about ₦10,000 up to around ₦85,000 depending on duration and instructor",
        address: "17a Ozumba Mbadiwe Ave, Victoria Island, Lagos",
        url: "https://laygoswatercrafts.com/",
      },
    ],
  },
  {
    id: "ceracerni",
    title: "Pottery and craft workshops in Lekki",
    blurb:
      "Ceracerni's is a Lekki creative hub where you can book a session to make something with your hands — pottery on the wheel is the one most people come for. It is the quietest of the group activities: two hours, something to carry home, and no skill needed.",
    bestFor: "Dates, a slow afternoon, anyone who wants to make something rather than watch one",
    price: "₦₦₦",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/25/A_potter_sculpting_a_clay_bowl.jpg/1280px-A_potter_sculpting_a_clay_bowl.jpg",
    imageAlt:
      "Clay-covered hands shaping the rim of a bowl on a spinning potter's wheel.",
    imageCredit: "Ayorinde Ogundele, CC BY-SA 4.0",
    imagePage: "https://commons.wikimedia.org/wiki/File:A_potter_sculpting_a_clay_bowl.jpg",
    imageNote: "Illustrative: a Nigerian potter at the wheel — no photograph of Ceracerni's Art Hub itself was available from the reachable sources checked",
    venues: [
      {
        name: "Ceracerni's Art Hub",
        area: "Lekki Phase 1",
        note: "A creative hub in Lekki Phase 1 offering pottery and other craft sessions by booking. The matching-clay workshop idea surfaced from an events listing, so treat the class name and dates as event-specific rather than a standing weekly class.",
        price: "Sessions listed from about ₦20,000",
        address: "Lekki Phase 1, Lagos",
        url: "https://ceracerniarthub.com/",
      },
    ],
  },
];

export const footballClubs: FootballClub[] = [
  {
    id: "sporting-lagos",
    name: "Sporting Lagos",
    league: "NPFL",
    ground: "Mobolaji Johnson Arena, Onikan",
    note: "The club that made Lagos fall back in love with league football. Promoted back to the top flight for 2026/27, playing at the 10,000-capacity Onikan ground — the oldest stadium in the country. Home games are usually late afternoon; buy in advance and go early for the crowd.",
    url: "https://www.sportinglagos.com/tickets",
  },
  {
    id: "ikorodu-city",
    name: "Ikorodu City",
    league: "NPFL",
    ground: "Mobolaji Johnson Arena, Onikan",
    note: "The Oga Boys finished fourth in the NPFL in 2024/25 and share Onikan with Sporting Lagos, so derby days are a short walk apart rather than a cross-city trip. Their own supporters travel in from Ikorodu.",
    url: "https://ikoroducityfc.com/",
  },
  {
    id: "inter-lagos",
    name: "Inter Lagos",
    league: "NPFL",
    ground: "Mobolaji Johnson Arena, Onikan",
    note: "Founded in 2023 and promoted for 2026/27 — the newest of the three top-flight Lagos clubs, and also at Onikan. Fixtures move, so check the NPFL list rather than turning up.",
    url: "https://npfl.com.ng/fixtures-results/",
  },
  {
    id: "ikorodu-united",
    name: "Ikorodu United",
    league: "Lower divisions",
    ground: "Onikan (historically)",
    note: "Not the same club as Ikorodu City — a common mix-up. Ikorodu United reached the top flight in 2016 and has since played in the lower leagues, so there is no reliable weekly fixture to plan around. If you want top-flight football in comfort, the three clubs above are the ones with published fixtures.",
  },
];

export const markets: Market[] = [
  {
    id: "idumota",
    name: "Idumota and Balogun",
    area: "Lagos Island",
    knownFor: "Clothes, Ankara, lace, shoes, bags",
    note: "One of the oldest and largest markets in West Africa, spread across Nnamdi Azikiwe, Docemo, Balogun and Oluwole. Balogun is the clothing arm: new clothes, fabric by the yard, and tailors who will run something up in a few days. Go with a local if you can, agree the price before anything is cut, and keep your phone out of your hand.",
    bestTime: "Weekday morning — by 2pm the lanes are solid",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f4/IThe_biggest_market_in_West_Africa%2C_dumota_Market%2C_Lagos.jpg/1280px-IThe_biggest_market_in_West_Africa%2C_dumota_Market%2C_Lagos.jpg",
    imageAlt: "A crowded lane of stalls and shoppers in Idumota market, Lagos.",
    imageCredit: "Sir Demo, CC BY-SA 4.0",
    imagePage:
      "https://commons.wikimedia.org/wiki/File:IThe_biggest_market_in_West_Africa,_dumota_Market,_Lagos.jpg",
  },
  {
    id: "katangua",
    name: "Katangua",
    area: "Abule Egba",
    knownFor: "Thrift (okrika) — the cheapest clothes in the city",
    note: "Also spelled Katangowa, and locally just \"Super\" after the bus stop it sits beside on the Lagos–Abeokuta expressway. Almost every stall is second-hand imports, sorted into bales. Monday, Tuesday and Friday are market days, when new bales are opened and the picking is best.",
    bestTime: "Monday, Tuesday or Friday morning",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/3/39/Ever-busy_market.jpg",
    imageAlt:
      "A busy open-air Lagos market street, used as an illustrative image for Katangua rather than a photograph of it.",
    imageNote: "Illustrative: a Lagos market street, not Katangua — no photograph of Katangua itself was found on the open-license sources checked, so the card uses a market scene instead.",
    imageCredit: "Dotun55, CC BY-SA 4.0",
    imagePage: "https://commons.wikimedia.org/wiki/File:Ever-busy_market.jpg",
  },
  {
    id: "yaba",
    name: "Yaba market",
    area: "Yaba",
    knownFor: "Cheap thrift and new clothes, \"bend down select\"",
    note: "Student-priced fashion next to Tejuosho and Ojuelegba: jeans, jackets, hoodies and dresses, new and used, at prices that assume you will haggle. Stalls set up through the day, so late afternoon and early evening is when the whole market is out.",
    bestTime: "Late afternoon into early evening",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Sunset_at_Yaba_Market%2C_Lagos.jpg/1280px-Sunset_at_Yaba_Market%2C_Lagos.jpg",
    imageAlt: "Yaba market at sunset, with stalls and shoppers along the street.",
    imageCredit: "JayMisra, CC BY-SA 4.0",
    imagePage:
      "https://commons.wikimedia.org/wiki/File:Sunset_at_Yaba_Market,_Lagos.jpg",
  },
  {
    id: "oyingbo",
    name: "Oyingbo",
    area: "Ebute Metta",
    knownFor: "Fish — frozen, imported and smoked",
    note: "One of the oldest trading hubs in the city, rebuilt in 2015 as a multi-storey complex. Frozen fish from Europe and Asia sits beside locally smoked species, and the prices here tend to set the tone for fish across Lagos. Also meat, fruit and household goods, and it opens late compared with the island markets.",
    bestTime: "Early morning for the fish, any day",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/88/Oyingbo_Market%2C_Lagos_Nigeria_2.jpg/1280px-Oyingbo_Market%2C_Lagos_Nigeria_2.jpg",
    imageAlt: "Traders and shoppers inside Oyingbo market, Lagos.",
    imageCredit: "Onikepe32, CC BY-SA 4.0",
    imagePage:
      "https://commons.wikimedia.org/wiki/File:Oyingbo_Market,_Lagos_Nigeria_2.jpg",
  },
  {
    id: "computer-village",
    name: "Computer Village",
    area: "Ikeja",
    knownFor: "Phones, laptops, repairs and SIM activation",
    note: "The largest technology market in the country: new and fairly-used phones and laptops, accessories, screens replaced while you wait, and SIM registration desks. Closed on Sundays. Price-check across three shops before you commit, and ask for the warranty in writing.",
    bestTime: "Weekday morning, before the afternoon crush",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/23/Computer_Village%2C_Ikeja-_Lagos.jpg/1280px-Computer_Village%2C_Ikeja-_Lagos.jpg",
    imageAlt: "Shop fronts and signage along Computer Village in Ikeja, Lagos.",
    imageCredit: "Tosin Toromade, CC BY-SA 4.0",
    imagePage:
      "https://commons.wikimedia.org/wiki/File:Computer_Village,_Ikeja-_Lagos.jpg",
  },
  {
    id: "trade-fair",
    name: "Trade Fair Complex",
    area: "Ojo",
    knownFor: "Wholesale — cosmetics, hair, jewellery, textiles, car parts",
    note: "A vast complex on the Badagry expressway, split into sections: auto parts, a China section, textiles and fashion. It is where shopkeepers buy rather than where you browse, but prices drop sharply if you take a carton. Go with a list and a driver who will wait.",
    bestTime: "Weekday morning; allow half a day",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/45/Market_place.jpg/1280px-Market_place.jpg",
    imageAlt:
      "A Lagos market street with stalls and awnings, used as an illustrative image for Trade Fair rather than a photograph of it.",
    imageNote: "Illustrative: a Lagos market street, not Trade Fair — no photograph of the Trade Fair Complex itself was found on the open-license sources checked, so the card uses a market scene instead.",
    imageCredit: "Prowessonovo, CC BY-SA 4.0",
    imagePage: "https://commons.wikimedia.org/wiki/File:Market_place.jpg",
  },
  {
    id: "mile-12",
    name: "Mile 12",
    area: "Kosofe, Ikorodu Road",
    knownFor: "Foodstuff wholesale — tomatoes, peppers, onions, yam",
    note: "The city's largest perishable market, supplied overnight by trailers from Plateau, Kaduna, Kano and Benue. If you are cooking for a houseful over December, this is where the food is cheapest — in bulk, at dawn, with a vehicle arranged in advance.",
    bestTime: "Before 8am",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e1/Mile_12_market_Lagos_Nigeria.jpg/1280px-Mile_12_market_Lagos_Nigeria.jpg",
    imageAlt: "Produce and stalls at Mile 12 market in Lagos.",
    imageCredit: "Jalol Pempeh, CC BY-SA 4.0",
    imagePage:
      "https://commons.wikimedia.org/wiki/File:Mile_12_market_Lagos_Nigeria.jpg",
  },
  {
    id: "alaba",
    name: "Alaba International",
    area: "Ojo",
    knownFor: "Electronics and home appliances",
    note: "The electronics counterpart to Trade Fair: sound systems, TVs, fridges, generators, and the repairers who keep them running. Cheaper than the malls and considerably more chaotic. Test anything electrical before it leaves the shop.",
    bestTime: "Weekday morning",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/45/Ojo_Alaba_international_market_Lagos_Electronics_section.jpg/1280px-Ojo_Alaba_international_market_Lagos_Electronics_section.jpg",
    imageAlt: "Electronics shops and stacked goods in the Alaba market section, Lagos.",
    imageCredit: "Kosykelvin, CC BY-SA 4.0",
    imagePage:
      "https://commons.wikimedia.org/wiki/File:Ojo_Alaba_international_market_Lagos_Electronics_section.jpg",
  },
];

/**
 * The first week, in order. These are the errands that make the rest of the
 * guide usable: a working line, cash in small notes, and somewhere to buy the
 * things you did not pack.
 */
export const newcomerSteps: NewcomerStep[] = [
  {
    title: "Get a local line and data",
    note: "A Nigerian SIM needs ID registration, so bring your passport. Any mall kiosk can do it; Computer Village in Ikeja has the most competition on price. An eSIM bought before you land works too, and saves the queue.",
    href: "/activities#markets",
    hrefLabel: "Markets",
  },
  {
    title: "Carry small notes",
    note: "Danfo, keke, beach gates and market stalls run on cash, and nobody wants to break a ₦1,000 note for a ₦200 fare. Withdraw during the day — ATMs empty out around holidays.",
    href: "/practicalities",
    hrefLabel: "Money in Lagos",
  },
  {
    title: "Do one market run",
    note: "Katangua or Yaba for clothes you did not pack, Oyingbo for fish, Mile 12 if you are cooking for a house. Go early, take small notes, and agree prices before anything is cut or bagged.",
    href: "/activities#markets",
    hrefLabel: "The markets",
  },
  {
    title: "Get into a game",
    note: "Book a five-a-side slot for the evening you land plus two, and you will have met ten people before the weekend. Funturf on the island and HabbyFx on the mainland are the easiest bookings.",
    href: "/activities#five-a-side",
    hrefLabel: "Five-a-side",
  },
  {
    title: "Watch a match at Onikan",
    note: "Three top-flight clubs share Mobolaji Johnson Arena this season. A late-afternoon kick-off is the cheapest good afternoon in the city, and the crowd is the point.",
    href: "/activities#football",
    hrefLabel: "Lagos clubs",
  },
  {
    title: "Learn the two trips you will make most",
    note: "Hotel to beach, and hotel to wherever your friends are staying. Work out both once, in daylight, before December traffic makes every journey a negotiation.",
    href: "/practicalities",
    hrefLabel: "Getting around",
  },
];
