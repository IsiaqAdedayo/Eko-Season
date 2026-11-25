import placesRaw from "../data/places.json" with { type: "json" };
import { type CorridorId } from "../lib/areas";

const places = placesRaw as Array<{ id: string; name: string }>;

const FONT = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

type Pin = { lat: number; lon: number; label: string; placeId: string | null };

function clusterPins(corridorId: CorridorId): Pin[] {
  const pins: Pin[] = [];
  if (corridorId === "lekki") {
    pins.push(
      { lat: 6.50, lon: 3.45, label: "Lekki Phase 1", placeId: null },
      { lat: 6.48, lon: 3.43, label: "Lekki Conservation Centre", placeId: "lekki-conservation-centre" },
      { lat: 6.46, lon: 3.42, label: "Elegushi Beach", placeId: "elegushi" },
      { lat: 6.44, lon: 3.40, label: "Oniru / Truth Beach", placeId: "truth-beach-club" },
      { lat: 6.46, lon: 3.44, label: "Nike Art Gallery", placeId: "nike-art-gallery" },
      { lat: 6.47, lon: 3.46, label: "Rufus & Bee", placeId: "rufus-and-bee" },
      { lat: 6.51, lon: 3.47, label: "La Campagne", placeId: "la-campagne" },
    );
  } else if (corridorId === "lagos-island") {
    pins.push(
      { lat: 6.48, lon: 3.38, label: "Onikan", placeId: null },
      { lat: 6.48, lon: 3.37, label: "National Museum", placeId: "national-museum" },
      { lat: 6.49, lon: 3.37, label: "Tafawa Balewa Square", placeId: "tafawa-balewa-square" },
      { lat: 6.49, lon: 3.39, label: "Cathedral Church of Christ", placeId: "cathedral-church-christ" },
      { lat: 6.48, lon: 3.40, label: "Freedom Park", placeId: "freedom-park" },
      { lat: 6.47, lon: 3.41, label: "Tarkwa Bay (by boat)", placeId: "tarkwa-bay" },
    );
  } else if (corridorId === "mainland") {
    pins.push(
      { lat: 6.58, lon: 3.32, label: "Ikeja", placeId: null },
      { lat: 6.58, lon: 3.33, label: "New Afrika Shrine", placeId: "new-afrika-shrine" },
      { lat: 6.52, lon: 3.37, label: "Yaba", placeId: null },
      { lat: 6.52, lon: 3.36, label: "Bukka Hut", placeId: "bukka-hut-yaba" },
      { lat: 6.53, lon: 3.35, label: "Ozone Cinemas", placeId: "ozone-cinemas" },
      { lat: 6.54, lon: 3.33, label: "Maryland", placeId: null },
      { lat: 6.54, lon: 3.32, label: "Purple Maryland", placeId: "purple-maryland" },
      { lat: 6.51, lon: 3.34, label: "Bariga", placeId: null },
      { lat: 6.51, lon: 3.33, label: "Love Lagos Jetty", placeId: "love-lagos-jetty" },
      { lat: 6.49, lon: 3.35, label: "Ebute Metta", placeId: null },
      { lat: 6.49, lon: 3.34, label: "Jaekel House", placeId: "jaekel-house" },
      { lat: 6.46, lon: 3.36, label: "Iganmu", placeId: null },
      { lat: 6.46, lon: 3.35, label: "National Theatre", placeId: "national-theatre" },
    );
  }
  return pins;
}

function mapBounds(corridorId: CorridorId) {
  const pins = clusterPins(corridorId);
  if (pins.length === 0) return { minLat: 0, maxLat: 0, minLon: 0, maxLon: 0, padding: 0 };
  const lats = pins.map((p) => p.lat);
  const lons = pins.map((p) => p.lon);
  return {
    minLat: Math.min(...lats) - 0.04,
    maxLat: Math.max(...lats) + 0.04,
    minLon: Math.min(...lons) - 0.04,
    maxLon: Math.max(...lons) + 0.04,
    padding: 32,
  };
}

const placeName = (id: string) => places.find((p) => p.id === id)?.name ?? id;

export function AreaMap({ corridorId }: { corridorId: CorridorId }) {
  const bounds = mapBounds(corridorId);
  const pins = clusterPins(corridorId);

  const width = 880;
  const height = 520;

  const venuePins = pins.filter((p) => p.placeId);
  const neighbourhoodLabels = [...new Set(pins.map((p) => p.label).filter((l) => !l.includes("(")))];

  const clusters: { label: string; x: number; y: number; placeIds: string[] }[] = neighbourhoodLabels.map((label) => {
    const pts = pins.filter((p) => p.label === label);
    const cx = pts.reduce((s, p) => s + lonToX(p.lon, bounds, width), 0) / pts.length;
    const cy = pts.reduce((s, p) => s + latToY(p.lat, bounds, height), 0) / pts.length;
    return { label, x: cx, y: cy, placeIds: pts.filter((p) => p.placeId).map((p) => p.placeId!) };
  });

  return (
    <div className="rounded-2xl border border-ink/10 bg-cream/70 p-4 sm:p-6">
      <p className="text-[10px] uppercase tracking-[0.2em] text-ember font-medium">
        Where things sit — roughly
      </p>
      <p className="mt-1 text-xs text-muted">
        A sketch, not a map. Distances and positions are only to give a feel for the corridor.
      </p>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-4 max-w-none overflow-visible"
        style={{ width: "100%", height: "auto", maxHeight: "460px" }}
        aria-hidden="true"
      >
        {clusters.map((cluster) => (
          <g key={cluster.label}>
            <rect
              x={cluster.x - 64}
              y={cluster.y - 22}
              width={128}
              height={44}
              fill="currentColor"
              fillOpacity={0.06}
              rx={22}
              className="text-ink"
            />
            <text
              x={cluster.x}
              y={cluster.y + 4}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="currentColor"
              className="text-[11px] font-medium text-ink"
              style={{ fontFamily: FONT }}
            >
              {cluster.label}
            </text>
          </g>
        ))}

        {venuePins.map((pin) => {
          const x = lonToX(pin.lon, bounds, width);
          const y = latToY(pin.lat, bounds, height);
          return (
            <g key={pin.placeId}>
              <circle cx={x} cy={y} r={7} fill="currentColor" className="text-ember" />
              <text x={x + 10} y={y + 4} fill="currentColor" className="text-[10px] text-ink/70" style={{ fontFamily: FONT }}>
                {pin.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-muted">
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-ember" />
          Venue on the guide
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-ink/10 border border-ink/20" />
          Neighbourhood
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {clusters
          .filter((c) => c.placeIds.length > 0)
          .map((cluster) => (
            <span key={cluster.label} className="inline-flex items-center gap-1 text-[11px] text-ember">
              <span className="font-medium text-ink">{cluster.label}:</span>
              {cluster.placeIds.map((id) => {
                const name = placeName(id);
                return (
                  <a
                    key={id}
                    href={`/places/${id}`}
                    className="underline decoration-ink/25 underline-offset-2 hover:decoration-ink transition"
                  >
                    {name}
                  </a>
                );
              })}
            </span>
          ))}
      </div>
    </div>
  );
}

function lonToX(lon: number, bounds: ReturnType<typeof mapBounds>, width: number) {
  const w = width - 2 * bounds.padding;
  return bounds.padding + ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * w;
}

function latToY(lat: number, bounds: ReturnType<typeof mapBounds>, height: number) {
  const h = height - 2 * bounds.padding;
  return bounds.padding + ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * h;
}
