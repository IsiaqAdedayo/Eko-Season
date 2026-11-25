import { ImageResponse } from "next/og";
import { movieEvents } from "../../lib/movies";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Movies in Lagos this December";

/** A card that lists the actual slate, so the preview is not a stock photo. */
export default async function Image() {
  const titles = movieEvents
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(150deg, #17100b 0%, #241a14 55%, #3a2113 100%)",
          padding: "60px 72px",
          color: "#fff7ec",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 22, letterSpacing: 6, color: "#f2a03d" }}>ÈKÓ SEASON</div>
          <div style={{ fontSize: 20, letterSpacing: 4, color: "rgba(255,247,236,0.45)" }}>
            SCREEN TIME
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1 }}>
            Movies in Lagos
          </div>
          <div style={{ marginTop: 12, fontSize: 26, color: "rgba(255,247,236,0.6)" }}>
            Nollywood and cinema releases this December
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {titles.map((movie) => (
            <div
              key={movie.id}
              style={{ display: "flex", justifyContent: "space-between", fontSize: 24, borderTop: "1px solid rgba(255,247,236,0.12)", paddingTop: 8 }}
            >
              <div style={{ color: "rgba(255,247,236,0.85)" }}>{movie.title.slice(0, 58)}</div>
              <div style={{ color: "#f2a03d" }}>{movie.date.slice(5)}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
