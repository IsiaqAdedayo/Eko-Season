import credits from "../data/photo-credits.json";
import captions from "../data/photo-captions.json";

type Credit = {
  author: string;
  license: string;
  licenseUrl?: string;
  page: string;
  title?: string;
  venue?: boolean;
  alt?: string;
  /** Where the photo came from, when it is not Wikimedia Commons. */
  source?: string;
};

/**
 * Local asset path, Unsplash delivery URL, or fully resolved remote URL.
 * Bare "photo-..." ids are Unsplash; anything else is passed through untouched.
 */
export const imageUrl = (id: string, width = 900, height?: number) =>
  id.startsWith("http") || id.startsWith("/")
    ? id
    : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80${height ? `&h=${height}` : ""}`;

/** Widths the Unsplash delivery URL can serve; enough for cards and heroes. */
export const IMAGE_WIDTHS = [480, 720, 960, 1440];

/**
 * A srcSet only where the URL supports arbitrary widths. A self-hosted file or
 * a fixed Commons thumbnail is returned without one, rather than asking for
 * sizes it does not have.
 */
export function imageSrcSet(
  id: string,
  widths: number[] = IMAGE_WIDTHS,
): string | undefined {
  if (!id.startsWith("photo-")) return undefined;
  return widths.map((width) => `${imageUrl(id, width)} ${width}w`).join(", ");
}

/** Attribution for the few Commons photos used in the galleries. */
export const photoCredit = (src: string): Credit | null =>
  (credits as Record<string, Credit>)[src] ?? null;

/** Return the gallery images that are actual venue shots (not illustrative stock). */
export const venuePhotos = (gallery: string[]) =>
  gallery.filter((src) => (credits as Record<string, Credit>)[src]?.venue).slice(0, 2);

/** Descriptive alt text for a gallery source, preferring credits then the caption file. */
export const galleryAltText = (src: string): string | undefined =>
  (credits as Record<string, Credit>)[src]?.alt ?? (captions as Record<string, string>)[src];

/** Fallback alt text for a place gallery image that has no curated caption yet. */
export const placeFallbackAlt = (placeName: string, placeCategory: string, placeArea: string, src: string) =>
  galleryAltText(src) ?? `${placeName} — ${placeCategory} in ${placeArea}`;

/** Fallback alt text for a show gallery image that has no curated caption yet. */
export const showFallbackAlt = (showTitle: string, src: string) =>
  galleryAltText(src) ?? `${showTitle} — more from the show`;

export type { Credit };

