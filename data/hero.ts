/**
 * Copy and photography for the rotating hero. Edit words here — the component
 * only handles the animation.
 *
 * `head` is two lines: the headline is set in uppercase display type, one span
 * per line, so keep each line short. `photo` is an Unsplash id or a full URL.
 */
export type Scene = {
  id: string;
  head: [string, string];
  kicker: string;
  label: string;
  description: string;
  photo: string;
  /** Visible attribution — the hero photos are all openly licensed. */
  credit: string;
};

/**
 * The hero's plan bar: three labels. The season it plans for is passed in at
 * render time, because it comes from the shows data, not from this file.
 */
export const planBar = {
  where: "Where",
  what: "What",
  when: "When",
};

export const scenes: Scene[] = [
  {
    id: "city",
    head: ["Welcome", "to Lagos"],
    kicker: "The Lagos guide",
    label: "Discover Lagos",
    description:
      "Music, food and traffic, month after month. A guide for people who have never done this city before.",
    photo: "photo-1682944856348-0665d4b8d81c",
    credit: "Illustrative stock photograph",
  },
  {
    id: "beach",
    head: ["Find", "your spot"],
    kicker: "Beaches, rooftops, tables",
    label: "Places to go",
    description:
      "Beach clubs in Oniru, rooftops in VI, quiet sand at Tarkwa Bay, and where to eat after all of it.",
    photo:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/76/Lekki_Beach_in_Lagos.jpg/1920px-Lekki_Beach_in_Lagos.jpg",
    credit: "Lekki beach — PelumiK, CC BY-SA 4.0",
  },
  {
    id: "night",
    head: ["Own", "the night"],
    kicker: "Clubs and concerts",
    label: "After dark",
    description:
      "Quilox, Vaniti, Boho — plus every big show worth buying a ticket for before it sells out.",
    photo:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/Third-mainland-bridge-at-night.jpg/1920px-Third-mainland-bridge-at-night.jpg",
    credit: "Third Mainland Bridge at night — S. Aderogba, CC BY-SA 4.0",
  },
  {
    id: "island",
    head: ["Lagos", "Island"],
    kicker: "Towers, marina, traffic",
    label: "The skyline",
    description:
      "The city's towers seen from the approach road, the marina on one side and the traffic on the other.",
    photo:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/12/Lagos_skyline.jpg/1920px-Lagos_skyline.jpg",
    credit: "Lagos Island from the bridge — Clara Sanchiz, CC BY-SA 2.0",
  },
];
