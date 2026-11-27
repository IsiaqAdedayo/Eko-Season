import places from "../data/places.json";

export type NightsSource = { label: string; url: string };

export type Place = {
  id: string;
  name: string;
  category: string;
  area: string;
  tagline: string;
  note: string;
  price: string;
  address: string | null;
  gallery: string[];
  checkedAt: string;
  nights: string[];
  nightsSource: NightsSource | null;
  nightsCheckedAt: string | null;
  /**
   * Shown under the lead image when it is not a photograph of the venue, so a
   * card never implies a stock shot is the place itself.
   */
  imageNote?: string;
  /** "closed" means the venue has shut permanently and is never listed. */
  status?: "open" | "closed";
};

/** A venue that has permanently shut. */
const isClosed = (place: Place) => place.status === "closed";

/**
 * Every venue the guide lists: the ones still trading.
 *
 * Closed entries stay in data/places.json for the record (and are validated
 * there), but they are never rendered: a card people can tap is a
 * recommendation, and a place that has shut is not one. Their detail routes
 * fall through to 404, and they are out of the sitemap and the search index.
 */
export const allPlaces = (places as Place[]).filter((place) => !isClosed(place));

export const CATEGORY_LABELS: Record<string, string> = {
  clubs: "Clubs",
  beaches: "Beaches",
  eats: "Eat & drink",
  play: "Games & cinema",
  culture: "Culture",
  landmarks: "Landmarks",
};

/** "Anything" plus one chip per category — shared by the hero and the grid. */
export const CATEGORY_TABS = [
  { value: "all", label: "Anything" },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

const NIGHT_LABELS: Record<string, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

/** ["fri","sat"] -> "Fri & Sat" */
export const nightsLabel = (nights: string[]) => {
  const labels = nights.map((night) => NIGHT_LABELS[night]).filter(Boolean);
  if (labels.length === 0) return null;
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(", ")} & ${labels.at(-1)}`;
};

/**
 * A weekly night only goes on the site when we can point at where it came
 * from. A venue we know runs midweek but have no listing for stays off.
 */
export const hasSourcedNights = (place: Place) =>
  place.nights.length > 0 &&
  place.nightsSource !== null &&
  place.nightsCheckedAt !== null;

export const scheduledPlaces = allPlaces.filter(hasSourcedNights);

/** Latest date any night schedule was read — the page never claims fresher. */
export const nightsCheckedOn = scheduledPlaces
  .map((place) => place.nightsCheckedAt as string)
  .reduce((latest, date) => (date > latest ? date : latest), "");

export const AREA_OPTIONS = [
  "Anywhere",
  "Victoria Island",
  "Ikoyi",
  "Lekki",
  "Lagos Island",
  "Mainland",
  "Ilashe",
];

const MAINLAND = [
  "Yaba",
  "Ikeja",
  "Maryland",
  "Bariga",
  "Ebute Metta",
  "Iganmu",
  "Surulere",
  "Ikorodu",
  "Apapa",
  "Agege",
];
const LEKKI_CORRIDOR = ["Oniru", "Eleko", "Chevron Drive", "Sangotedo"];
const ISLAND_WATER = ["Lagos Island", "Lagos Harbour"];

export function getPlace(id: string) {
  return allPlaces.find((place) => place.id === id);
}

/**
 * "Lekki" and "Mainland" are corridors rather than single areas, so they
 * match a set of neighbourhoods instead of one exact string.
 */
export function matchesArea(place: Place, area: string) {
  if (area === "Anywhere") return true;
  if (area === "Mainland") return MAINLAND.includes(place.area);
  if (area === "Lekki")
    return place.area.startsWith("Lekki") || LEKKI_CORRIDOR.includes(place.area);
  if (area === "Lagos Island") return ISLAND_WATER.includes(place.area);
  return place.area === area;
}

/** One filter rule for every list: category plus the area corridors. */
export function filterPlaces(
  category: string,
  area: string,
  places: Place[] = allPlaces,
) {
  return places.filter(
    (place) =>
      (category === "all" || place.category === category) &&
      matchesArea(place, area),
  );
}

/** Google Maps search link — no API key, works on mobile and desktop. */
export const mapsSearch = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const mapUrl = (place: Place) =>
  mapsSearch(place.address ?? `${place.name}, ${place.area}, Lagos, Nigeria`);

/**
 * A directions link for an evening: first stop in, last stop out, the rest as
 * waypoints. Google Maps accepts up to nine stops and no API key is needed.
 */
export function mapsRoute(places: Place[]) {
  const stops = places.slice(0, 10);
  if (stops.length < 2) return null;

  const query = (place: Place) =>
    encodeURIComponent(place.address ?? `${place.name}, ${place.area}, Lagos`);

  const [origin, ...rest] = stops;
  const destination = rest.pop() ?? origin;
  const params = new URLSearchParams({
    api: "1",
    origin: origin.address ?? `${origin.name}, ${origin.area}, Lagos`,
    destination: destination.address ?? `${destination.name}, ${destination.area}, Lagos`,
  });
  if (rest.length > 0) params.set("waypoints", rest.map(query).join("|"));

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

