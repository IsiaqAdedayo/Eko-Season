import showsData from "../data/shows.json";
import sourceStatus from "../data/show-source-status.json";

export type Tier = {
  name: string;
  price: number;
  soldOut?: boolean;
};

export type ShowEvent = {
  id: string;
  title: string;
  artists?: string[];
  date: string;
  endDate: string | null;
  venue: string;
  area: string | null;
  city: string;
  priceFrom: number | null;
  currency: string;
  tiers: Tier[];
  ticketUrl: string | null;
  /** Set by the refresh job: "dead" means the link no longer loads. */
  ticketStatus?: "ok" | "dead";
  source: string;
  sourceUrl: string;
  note: string | null;
  /** Scraped classification: "party" covers raves, club nights, day parties. */
  kind?: "show" | "party";
  /** The platform's own tags, kept so the party decision is auditable. */
  tags?: string[];
  /**
   * A free ticket is listed for this event.
   *
   * Eventbrite's free-events feed proves a free tier exists, not that entry is
   * free, so this is kept apart from priceFrom and never rendered as "Free
   * entry".
   */
  freeTicket?: boolean;
  description?: string;
  leadImage?: string;
  photos?: string[];
  tickets?: ShowTicket[];
};

export type ShowTicket = {
  id: string;
  label: string;
  url: string;
};

export const showEvents = showsData.events as ShowEvent[];
export const showsUpdatedAt = showsData.updatedAt;

/** What the last shows scrape found, per source. Written by scripts/scrape-shows.mjs. */
export type ShowSourceHealth = {
  name: string;
  ok: boolean;
  events: number;
  error: string | null;
};

const status = sourceStatus as { sources?: ShowSourceHealth[] };

export const showSourceHealth = status.sources ?? [];

export const getShow = (id: string) =>
  showEvents.find((event) => event.id === id);
export const naira = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

export const shortDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

export const dateRange = (event: ShowEvent) =>
  event.endDate && event.endDate !== event.date
    ? `${shortDate(event.date)} – ${shortDate(event.endDate)}`
    : shortDate(event.date);

export const isParty = (event: ShowEvent) => event.kind === "party";

/**
 * The budget hint, and only for a price the source actually published.
 *
 * "Low budget" is a number, not a vibe: ₦10,000 a head, which is what the cheap
 * end of a Lagos night out costs. Free is not a badge — `priceLabel` already
 * says a free ticket is listed — and an unpublished price is never guessed.
 */
const LOW_BUDGET_LIMIT = 10_000;

export const priceBadge = (event: ShowEvent) =>
  event.priceFrom != null &&
  event.priceFrom > 0 &&
  event.priceFrom <= LOW_BUDGET_LIMIT
    ? `Under ${naira(LOW_BUDGET_LIMIT)}`
    : null;

/** One price line for cards, so no page invents its own wording. */
export const priceLabel = (event: ShowEvent) => {
  if (event.priceFrom != null) {
    return event.priceFrom === 0
      ? "Free ticket"
      : `From ${naira(event.priceFrom)}`;
  }
  return event.freeTicket ? "Free ticket listed" : "Price not published";
};
