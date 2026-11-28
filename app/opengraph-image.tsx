import { ImageResponse } from "next/og";
import { allPlaces } from "../lib/place";
import { showEvents } from "../lib/shows";
import { seasonLabel } from "../lib/season";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "Èkó Season — the Lagos guide: places, shows and how to get around";

/**
 * The site-wide share card, in the same ink-and-gold language as the per-show
 * cards. No remote assets, so a link pasted in a group chat previews even when
 * the image CDN is having a bad day.
 */
export default function Image() {
  // One string, not JSX fragments: Satori needs display:flex on any div with
  // more than one child, and this line is pure text.
  const stats = `${allPlaces.length} places · ${showEvents.length} shows · one city`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(140deg, #17100b 0%, #2b1a10 60%, #3a2113 100%)",
          padding: "64px 72px",
          color: "#fff7ec",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 22, letterSpacing: 6, color: "#f2a03d" }}>
            ÈKÓ SEASON
          </div>
          <div
            style={{
              fontSize: 20,
              letterSpacing: 4,
              color: "rgba(255,247,236,0.45)",
            }}
          >
            {seasonLabel().toUpperCase()}
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
            LAGOS, NIGERIA
          </div>

          <div
            style={{
              marginTop: 28,
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.06,
              letterSpacing: -1.5,
              maxWidth: 980,
            }}
          >
            The Lagos guide, all year
          </div>

          <div
            style={{
              marginTop: 24,
              fontSize: 28,
              color: "rgba(255,247,236,0.62)",
              maxWidth: 940,
            }}
          >
            Where to go, what to eat, who is playing, and how to move around
            without losing an hour to traffic.
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
          <div>{stats}</div>
          <div style={{ color: "#f2a03d" }}>ekoseason · the Lagos guide</div>
        </div>
      </div>
    ),
    size,
  );
}
