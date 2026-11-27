import { imageUrl } from "./media";

type NavLink = { href: string; label: string };

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

/** Shown under the transport fares. */
export const FARES_CHECKED = "16 November 2026";

/** Default share image: a real Lagos beach scene rather than a sunset stock photo. */
export const SOCIAL_IMAGE = imageUrl(
  "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/The-elegushi-beach-lagos.jpg/1920px-The-elegushi-beach-lagos.jpg",
  1200,
  630,
);

/** Primary navigation links in the header and footer. */
export const NAV_LINKS: NavLink[] = [
  { href: "/places", label: "Places" },
  { href: "/activities", label: "Activities" },
  { href: "/shows", label: "Shows" },
  { href: "/movies", label: "Movies" },
  { href: "/weather", label: "Weather" },
  { href: "/practicalities", label: "Practicalities" },
];

/** Area links shown in the footer. */
export const AREA_LINKS: NavLink[] = [
  { href: "/places/area/victoria-island", label: "Victoria Island" },
  { href: "/places/area/ikoyi", label: "Ikoyi" },
  { href: "/places/area/lekki", label: "Lekki" },
  { href: "/places/area/lagos-island", label: "Lagos Island" },
  { href: "/places/area/mainland", label: "Mainland" },
];

/** Format an ISO date string (YYYY-MM-DD) as "16 November 2026". */
export function formatChecked(date: string | null | undefined): string {
  if (!date) return "—";
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return date;
  return new Date(year, month - 1, day)
    .toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** Where a reader's correction should land. Set at deploy time once the
 * inbox is verified — absent or empty means the link is shown but the report
 * route is deliberately missing until a destination exists. */
export const REPORT_EMAIL =
  process.env.REPORT_EMAIL ?? "isiaqadedayo@outlook.com";
