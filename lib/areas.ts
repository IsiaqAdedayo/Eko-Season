import { matchesArea, CATEGORY_LABELS, type Place } from "./place";

export type CorridorId = "lekki" | "lagos-island" | "mainland";

export const CORRIDORS: Record<CorridorId, { label: string; title: string; copy: string; arrive: string; description: string; neighbourhoods: string[]; knownFor: string }> = {
  lekki: {
    label: "Lekki",
    title: "Lekki",
    copy: "lekki",
    arrive: "Lekki-Epe Expressway is the road in. From VI it is the long way round; from the mainland it is the usual way out.",
    description: "Lekki is the long peninsula southeast of Victoria Island — beaches, malls, art, arcades and the calmer end of the city. Most of the beach scene lives here, and so does a lot of the December crowd.",
    neighbourhoods: ["Lekki Phase 1", "Lekki", "Oniru", "Eleko", "Chevron Drive"],
    knownFor: "Beaches, malls and the quieter end of the city",
  },
  "lagos-island": {
    label: "Lagos Island",
    title: "Lagos Island",
    copy: "lagos-island",
    arrive: "Third Mainland Bridge brings you to the Island from the mainland; the Blue Line drops you at Marina from Ebute Metta.",
    description: "Lagos Island is the old city — the harbour, the ministries, the museums and the square where Nigeria became independent. It is slower and denser than the rest of the guide, and it is where the history is.",
    neighbourhoods: ["Lagos Island", "Lagos Harbour"],
    knownFor: "History, the harbour and the old city",
  },
  mainland: {
    label: "Mainland",
    title: "Mainland",
    copy: "mainland",
    arrive: "The Third Mainland Bridge, the Blue Line and the ring road all feed the Mainland; Ikeja is the commercial centre, Yaba is the student end.",
    description: "The Mainland is everything east and north of the lagoon — Ikeja, Yaba, Maryland, Bariga and Ebute Metta. It has the music, the bukas, the cinemas and the rail line, and it is where most Lagosians actually live.",
    neighbourhoods: ["Ikeja", "Yaba", "Maryland", "Bariga", "Ebute Metta", "Iganmu"],
    knownFor: "Music, food and the rail line",
  },
};

export function corridorById(id: string): typeof CORRIDORS[CorridorId] | undefined {
  return CORRIDORS[id as CorridorId];
}

export { matchesArea, CATEGORY_LABELS, type Place };

export type Corridor = typeof CORRIDORS[CorridorId];


