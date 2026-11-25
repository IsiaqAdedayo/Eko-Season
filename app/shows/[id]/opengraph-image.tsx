import { ImageResponse } from "next/og";
import { dateRange, getShow } from "../../../lib/shows";

/** Satori's bundled font has no naira glyph, so the card spells it out. */
const priceLabel = (value: number | null | undefined) =>
  value == null
    ? "Tickets and prices on the guide"
    : `Tickets from NGN ${value.toLocaleString("en-NG")}`;

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A Detty December show in Lagos";

/**
 * One PNG per show, so a link pasted into WhatsApp previews with that show's
 * name and date instead of a generic photo. No remote assets: this has to
 * render even when the rest of the internet is having a bad day.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = getShow(id);
  const title = (event?.title ?? "Detty December").slice(0, 90);

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
            DETTY DECEMBER 2026
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              background: "rgba(242,160,61,0.16)",
              color: "#f2a03d",
              padding: "10px 24px",
              borderRadius: 999,
              fontSize: 26,
              letterSpacing: 2,
            }}
          >
            {event ? dateRange(event).toUpperCase() : "DECEMBER 2026"}
          </div>

          <div
            style={{
              marginTop: 28,
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -1,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>

          <div
            style={{
              marginTop: 22,
              fontSize: 28,
              color: "rgba(255,247,236,0.62)",
              maxWidth: 980,
            }}
          >
            {event ? [event.venue, event.area, event.city].filter(Boolean).join(", ") : "Lagos"}
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
          <div>{priceLabel(event?.priceFrom)}</div>
          <div style={{ color: "#f2a03d" }}>ekoseason · the December guide</div>
        </div>
      </div>
    ),
    size,
  );
}
