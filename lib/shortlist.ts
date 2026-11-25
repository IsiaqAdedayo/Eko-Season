export type PickKind = "place" | "show";

export type Pick = { kind: PickKind; id: string };

export const SHORTLIST_KEY = "ekoseason:shortlist";
export const SHORTLIST_EVENT = "ekoseason:shortlist-change";

/** Bounded so a share link can never render an absurd page. */
export const MAX_PICKS = 30;

export function isPick(value: unknown): value is Pick {
  if (!value || typeof value !== "object") return false;
  const pick = value as Record<string, unknown>;
  return (
    (pick.kind === "place" || pick.kind === "show") &&
    typeof pick.id === "string"
  );
}

export const samePick = (a: Pick, b: Pick) => a.kind === b.kind && a.id === b.id;

/** `/list?places=quilox,vaniti&shows=davido-oriade-the-residency` */
export function shortlistHref(items: Pick[]) {
  const places = items.filter((i) => i.kind === "place").map((i) => i.id);
  const shows = items.filter((i) => i.kind === "show").map((i) => i.id);

  const params = new URLSearchParams();
  if (places.length > 0) params.set("places", places.join(","));
  if (shows.length > 0) params.set("shows", shows.join(","));

  const query = params.toString();
  return query ? `/list?${query}` : "/list";
}

export function splitIds(value?: string) {
  return (value ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, MAX_PICKS);
}
