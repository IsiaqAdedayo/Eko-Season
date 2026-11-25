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
    kicker: "Detty December",
    label: "Discover Lagos",
    description:
      "Thirty days of music, food and traffic. A guide for people who have never done this city before.",
    photo: "photo-1682944856348-0665d4b8d81c",
  },
  {
    id: "beach",
    head: ["Find", "your spot"],
    kicker: "Beaches, rooftops, tables",
    label: "Places to go",
    description:
      "Beach clubs in Oniru, rooftops in VI, quiet sand at Tarkwa Bay, and where to eat after all of it.",
    photo: "photo-1787478555928-40f802c6bf7b",
  },
  {
    id: "night",
    head: ["Own", "the night"],
    kicker: "Clubs and concerts",
    label: "After dark",
    description:
      "Quilox, Vaniti, Boho — plus every big show worth buying a ticket for before it sells out.",
    photo: "photo-1763757575623-ffafe0867aa3",
  },
];
