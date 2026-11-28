/**
 * Headings for the home-page sections. Copy lives here so a wording change
 * never means touching layout — same arrangement as data/hero.ts.
 */
export type SectionHeading = {
  eyebrow?: string;
  title: string;
};

export const sections: Record<
  | "places"
  | "eat"
  | "dishes"
  | "shows"
  | "transport"
  | "tonight"
  | "parties",
  SectionHeading
> = {
  places: {
    eyebrow: "Where to go",
    title: "The places that make Lagos",
  },
  eat: {
    eyebrow: "Where to eat",
    title: "Where we would book a table",
  },
  dishes: {
    eyebrow: "What to eat",
    title: "The plates to plan a day around",
  },
  shows: {
    eyebrow: "What’s on",
    title: "Big shows, big names",
  },
  transport: {
    eyebrow: "Getting around",
    title: "How Lagos actually moves",
  },
  tonight: {
    title: "Tonight and this week",
  },
  parties: {
    eyebrow: "Raves and cheap nights",
    title: "Parties and raves this week",
  },
};
