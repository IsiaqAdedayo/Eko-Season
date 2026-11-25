export type Mode = {
  name: string;
  local: string;
  fare: string;
  pay: string;
  how: string;
  tip: string;
};

export type Recipe = {
  id: string;
  from: string;
  to: string;
  total: string;
  time: string;
  summary: string;
  steps: { mode: string; detail: string; cost: string }[];
  warning: string;
};

export const modes: Mode[] = [
  {
    name: "Danfo",
    local: "Yellow minibus",
    fare: "₦300–₦1,000",
    pay: "Cash, or transfer to the conductor",
    how: "Flag it, shout your stop, squeeze in. The conductor collects.",
    tip: "Agree the fare before you sit down, and keep small notes. Handing over ₦5,000 for a ₦700 trip is how arguments start.",
  },
  {
    name: "Keke napep",
    local: "Tricycle",
    fare: "₦200–₦700",
    pay: "Cash",
    how: "Short hops and estate roads. Ubiquitous off the main highways.",
    tip: "Restricted on many major roads. If a keke driver refuses a route, it is usually the law, not the traffic.",
  },
  {
    name: "BRT",
    local: "Regulated bus",
    fare: "₦450–₦1,080",
    pay: "Cowry card only",
    how: "Dedicated lanes on the big corridors. Tap in at the terminal.",
    tip: "Since August 2026 cash is not allowed on LAMATA buses — top up Cowry before you leave the house.",
  },
  {
    name: "Blue Line",
    local: "Rail",
    fare: "₦750 full line",
    pay: "Cowry card",
    how: "Marina to Mile 2 in about 25 minutes, no traffic.",
    tip: "The only reliable way to beat a Third Mainland jam. Off-peak fares are sometimes discounted.",
  },
  {
    name: "Bolt",
    local: "Ride-hailing",
    fare: "App quote",
    pay: "Card or wallet in app",
    how: "The default app in Lagos, and the widest coverage.",
    tip: "Check the plate and driver name before you get in, and share the trip at night.",
  },
  {
    name: "inDrive",
    local: "Ride-hailing, bid a fare",
    fare: "Usually below Bolt",
    pay: "Card or cash",
    how: "Name your price; drivers accept or counter. Also runs a Keke tier for 6–7km trips.",
    tip: "Cheaper if you are willing to haggle, slower if you are not.",
  },
  {
    name: "LagRide",
    local: "Lagos state e-taxi",
    fare: "App quote",
    pay: "Card or wallet",
    how: "Government-backed fleet, petrol and electric, Lagos only.",
    tip: "Smaller fleet than Bolt, so it is a backup rather than a plan.",
  },
  {
    name: "Ferry",
    local: "LAGFERRY",
    fare: "₦2,200 Ikorodu–Falomo",
    pay: "Cash, POS or Cowry",
    how: "Ikorodu–Falomo–CMS, Badore–Ikoyi. Weekdays, roughly 6:30am–6pm; last departures mid-afternoon.",
    tip: "Life jackets are mandatory and enforced. Shorter crossings cost less than the Ikorodu run, and the lagoon beats the road when the bridge is standing still.",
  },
];

export const recipes: Recipe[] = [
  {
    id: "airport-to-island",
    from: "Murtala Muhammed (LOS)",
    to: "VI / Lekki",
    total: "₦10,000–45,000",
    time: "45 min–2.5 hrs",
    summary:
      "No train reaches the airport. With luggage, a car is the only sane first move.",
    steps: [
      {
        mode: "Arrivals",
        detail:
          "Clear immigration and baggage — 30 to 90 minutes is normal on an international arrival. Buy a SIM or get data before you book anything.",
        cost: "—",
      },
      {
        mode: "Bolt or inDrive",
        detail:
          "Pick the app pickup point, not the tout at the door. Fares surge when several wide-body arrivals land together.",
        cost: "₦10,000–25,000",
      },
      {
        mode: "Pre-booked car",
        detail:
          "The reliable version: fixed price, driver waits with your name, no negotiation at midnight.",
        cost: "₦25,000–45,000",
      },
    ],
    warning:
      "Official airport taxis run ₦20,000–40,000 with no meter — agree before you get in. The budget chain (keke to Ikeja, Red Line to Oyingbo, Bolt to VI ≈ ₦4,500) exists, but it is weekday-only and miserable with bags.",
  },
  {
    id: "ikeja-to-island",
    from: "Ikeja",
    to: "Victoria Island / Ikoyi",
    total: "₦3,500–12,000",
    time: "60–120 min",
    summary:
      "The Red Line does the painful half for ₦1,000, then you finish by road.",
    steps: [
      {
        mode: "Red Line",
        detail:
          "Ikeja to Oyingbo, about 30 minutes on the shared corridor. Cowry card only, and it runs weekdays only — nine trains a day, so check the timetable before you commit.",
        cost: "₦1,000 full trip; less by zone",
      },
      {
        mode: "Bolt or keke",
        detail:
          "Oyingbo to VI or Ikoyi. Oyingbo is a market and bus terminal, not Marina — agree the pickup pin before you walk out.",
        cost: "₦2,500–5,000",
      },
    ],
    warning:
      "There is no interchange between the Red Line at Oyingbo and the Blue Line at Marina — the gap is a road journey that can eat the time you saved. Straight Bolt is ₦6,000–12,000 and 45–120 minutes depending on Third Mainland.",
  },
  {
    id: "island-to-mainland",
    from: "Marina / TBS",
    to: "Mile 2 / Ikorodu",
    total: "₦750–2,200",
    time: "25–70 min",
    summary:
      "The Blue Line is the only trip in Lagos where traffic cannot touch you.",
    steps: [
      {
        mode: "Blue Line",
        detail:
          "Marina to Mile 2 in about 25 minutes. Trains every 8–12 minutes at peak, service to about 21:50, Cowry card only. Off-peak (10am–4pm) fares are discounted.",
        cost: "₦750 full line",
      },
      {
        mode: "BRT from Mile 2",
        detail:
          "Mile 2 to TBS for the Island side, or pick up the Ikorodu corridor from TBS.",
        cost: "₦680–960",
      },
      {
        mode: "Ferry alternative",
        detail:
          "CMS/Marina to Ikorodu by water, roughly 50 minutes. Weekday departures cluster in the morning and late afternoon — miss the last one and you are on the road.",
        cost: "₦2,200",
      },
    ],
    warning:
      "Blue Line runs Monday to Saturday with a reduced Sunday service; the Red Line does not run at weekends at all. Neither takes cash.",
  },
];
