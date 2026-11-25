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
