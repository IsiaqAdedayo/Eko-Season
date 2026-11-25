import { ImageResponse } from "next/og";
import { CATEGORY_LABELS, getPlace } from "../../../lib/place";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A Lagos place in the Èkó Season guide";

/**
 * One card per venue, so a shared place link previews with the name and area
 * instead of a generic beach photo. No remote assets: it must render even when
 * the image CDN is slow.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const place = getPlace(id);
  const title = (place?.name ?? "Lagos in December").slice(0, 80);
  const category = place
    ? (CATEGORY_LABELS[place.category] ?? place.category)
    : "The December guide";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(140deg, #17100b 0%, #2b1a10 60%, #3a2113 100%)",
          padding: "64px 72px",
          color: "#fff7ec",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 22, letterSpacing: 6, color: "#f2a03d" }}>
            ÈKÓ SEASON
          </div>
          <div style={{ fontSize: 20, letterSpacing: 4, color: "rgba(255,247,236,0.45)" }}>
            {category.toUpperCase()}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1, maxWidth: 1000 }}>
            {title}
          </div>
          <div style={{ marginTop: 22, fontSize: 28, color: "rgba(255,247,236,0.62)" }}>
            {place ? [place.area, place.price].filter(Boolean).join(" · ") : "Lagos"}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "1px solid rgba(255,247,236,0.15)",
            paddingTop: 24,
            fontSize: 24,
            color: "rgba(255,247,236,0.55)",
          }}
        >
          <div style={{ maxWidth: 820 }}>{place?.tagline ?? "Where to go, what to eat, who is playing"}</div>
          <div style={{ color: "#f2a03d" }}>ekoseason · December guide</div>
        </div>
      </div>
    ),
    size,
  );
}
