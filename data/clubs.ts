/**
 * The Lagos clubs, in enough depth for a page of their own.
 *
 * Facts were read on 26 November 2026 from the clubs' own sites, the NPFL and
 * Wikipedia. Colours are given only where a club states them; where it does
 * not, the page says so rather than guessing. Fixtures are not stored here —
 * they come from lib/fixtures.ts, which reads the league's own table.
 */

export type ClubColour = { name: string; hex: string };

export type Club = {
  id: string;
  name: string;
  short: string;
  league: string;
  founded: string;
  nickname: string;
  ground: string;
  summary: string;
  story: string[];
  colours?: ClubColour[];
  /** Shown instead of swatches when the club has not published its colours. */
  kitNote?: string;
  honours: string[];
  matchday: string[];
  /** Strings matched against NPFL fixture rows. */
  aliases: string[];
  ticketsUrl?: string;
  siteUrl?: string;
  /** Shown when there are no league fixtures to list. */
  fixtureNote?: string;
};

export const clubs: Club[] = [
  {
    id: "sporting-lagos",
    name: "Sporting Lagos",
    short: "Sporting",
    league: "Nigeria Premier Football League",
    founded: "3 February 2022",
    nickname: "The Noisy Lagosians",
    ground: "Mobolaji Johnson Arena (Onikan Stadium), Onikan",
    summary:
      "The club that made Lagos care about league football again — founded in 2022, promoted, relegated, and back in the top flight for 2026/27.",
    story: [
      "Sporting Lagos was founded on 3 February 2022 by Shola Akinlade, and played its first match eleven days later. It was in the top flight by the 2023/24 season, and became the first Lagos club to pass 100,000 followers on its main social account — a support base built on kits, graphics and matchday presentation as much as on results.",
      "The first top-flight spell ended in relegation, but the club won the Nigeria National League in 2025/26 under Jeffrey Buter and came straight back. The 2026/27 home shirt is called \"Still in Blue\" — the club's own line is that blue has been the home colour since the first game.",
      "On the pitch this season they are mid-table and drawing a lot: four wins, four draws and four defeats from twelve matches by late November. The crowd is the reason to go rather than the league position.",
    ],
    colours: [
      { name: "Blue", hex: "#1B3FA0" },
      { name: "Yellow", hex: "#F2C200" },
    ],
    kitNote: "Swatches are approximate, taken from the club's kits and badge — not official Pantone values.",
    honours: [
      "Nigeria National League winners, 2025/26 (promoted)",
      "Naija Super 8 winners, 2023",
    ],
    matchday: [
      "Buy before you travel — the club sells tickets on its own site, and the gate queue is the slow part of the afternoon.",
      "Onikan is open-air with one covered stand. For a 4pm kick-off the cover is worth paying for.",
      "Kick-off times move for television. Check the club's page the day before rather than the fixture list here.",
    ],
    aliases: ["Sporting Lagos"],
    ticketsUrl: "https://www.sportinglagos.com/",
    siteUrl: "https://www.sportinglagos.com/",
  },
  {
    id: "ikorodu-city",
    name: "Ikorodu City",
    short: "City",
    league: "Nigeria Premier Football League",
    founded: "January 2022",
    nickname: "Oga Boys",
    ground: "Mobolaji Johnson Arena (Onikan Stadium), Onikan",
    summary:
      "A community club from Ikorodu that reached the top flight in 2024 and finished fourth in both of its NPFL seasons.",
    story: [
      "Ikorodu City was founded in January 2022 and run as a community club under a board led by Sanmi Doherty, with a stated aim of taking players off the street and giving them a route into the professional game.",
      "Three seasons in the Nigeria National League ended with promotion in 2024. Since then the club has finished fourth in 2024/25 and fourth again in 2025/26 — the most consistent Lagos side of the three in the top flight, and the one that has been there longest.",
      "The club counts three Lagos FA Cup titles, and plays its home games at Onikan rather than in Ikorodu: the only Lagos ground approved for NPFL fixtures this season.",
    ],
    colours: [
      { name: "White", hex: "#F7F5EF" },
      { name: "Yellow", hex: "#F2C400" },
      { name: "Maroon", hex: "#6B1F2A" },
    ],
    kitNote: "The club describes its colours as white, yellow and maroon in its own kit announcements; the swatches are approximate.",
    honours: [
      "Lagos FA Cup: three-time winners (the club's own count)",
      "NPFL: 4th, 2024/25 and 2025/26",
    ],
    matchday: [
      "The away end is the loudest part of the ground: their supporters travel out from Ikorodu for away games.",
      "Onikan is shared by three clubs this season, so check which club is at home before you buy — the fixture list here names the home side.",
      "Tickets are sold at the ground; there is no club app to book through.",
    ],
    aliases: ["Ikorodu City"],
    siteUrl: "https://www.ikoroducityfc.com/",
  },
  {
    id: "inter-lagos",
    name: "Inter Lagos",
    short: "Inter",
    league: "Nigeria Premier Football League",
    founded: "2023",
    nickname: "The Pride of Lagos",
    ground: "Mobolaji Johnson Arena (Onikan Stadium), Onikan",
    summary:
      "The newest of the three: founded in 2023, promoted from the NNL in 2026, and already Sporting Lagos' nearest rival.",
    story: [
      "Inter Lagos was founded in 2023 by Lanre Vigo, Olumide Fayankin and Gatumi Aliyu, and played its first NNL match that November. The club styles itself \"The Pride of Lagos\" and has been treated as Sporting Lagos' rival since its first season.",
      "Promotion came in 2025/26: a 1–1 draw with Smart City sealed top spot in NNL Conference A with a game to spare, on 29 points from 15 matches. The 2026/27 campaign is its first in the top flight.",
      "It has been a hard start — bottom of the table in late November, with the leakiest defence in the division. The away support is small but the derby against Sporting Lagos is the fixture the season is built around.",
    ],
    kitNote:
      "We could not confirm the club's colours from a published source. It released its 2026/27 jerseys in August 2026 — check that post before you buy a shirt.",
    honours: ["NNL Conference A winners, 2025/26 (promoted)"],
    matchday: [
      "The Lagos derby against Sporting Lagos is the one to book early; the rest of the home games are walk-up.",
      "Onikan again — three clubs share it, so the ground looks different depending on who is at home.",
      "Expect an open game: they have conceded more than anyone in the league this season.",
    ],
    aliases: ["Inter Lagos"],
    siteUrl: "https://x.com/InterLagosFC",
  },
  {
    id: "ikorodu-united",
    name: "Ikorodu United",
    short: "United",
    league: "Lower divisions",
    founded: "1 January 2009",
    nickname: "Ikorodu United",
    ground: "Onikan Stadium (historically)",
    summary:
      "The older Ikorodu club, not to be confused with Ikorodu City — in the top flight for one season, 2015/16, and in the lower leagues since.",
    story: [
      "Ikorodu United was founded on 1 January 2009 and reached the Nigeria Premier League in 2015/16 after consecutive promotions from the Nationwide League and the NNL. Its first top-flight match was a 1–1 draw with Abia Warriors at Onikan.",
      "That season ended in relegation and the club has played in the lower divisions since. It is a different club from Ikorodu City, a mix-up the similar names invite.",
      "There is no weekly fixture to plan around, so this page carries no fixture table: the NPFL site only publishes the top division.",
    ],
    honours: ["NPFL promotion, 2015/16"],
    matchday: [
      "Not a top-flight club this season — check the Lagos State FA and lower-league listings before travelling.",
      "If you want league football at Onikan, the three clubs above are the ones with published fixtures.",
    ],
    aliases: ["Ikorodu United"],
    fixtureNote:
      "No NPFL fixtures: the club has not been in the top division since 2016, and the league site only lists the current top-flight season.",
  },
];

export const getClub = (id: string) => clubs.find((club) => club.id === id);
