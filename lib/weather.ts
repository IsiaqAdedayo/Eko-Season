/** Weather for Lagos, fetched server-side from Open-Meteo (no key, CC BY 4.0). */

const LAGOS_LAT = 4.674868;
const LAGOS_LON = 6.280788;
const LAGOS_TZ = "Africa/Lagos";

/** 900s between polls is enough for a forecast people actually plan around. */
export const WEATHER_REVALIDATE = 1800;

export type WeatherSnapshot = {
  /** CC BY 4.0 — https://open-meteo.com/en/docs */
  source: "Open-Meteo (CC BY 4.0)";
  fetchedAt: string; // ISO in Lagos time
  today: DayWeather;
  days: DayWeather[];
  degraded: boolean; // true when the live fetch failed and we fell back
};

export type DayWeather = {
  date: string; // ISO YYYY-MM-DD
  weekday: string; // long, e.g. "Monday"
  tempMax: number | null; // °C
  tempMin: number | null; // °C
  tempFeelMax: number | null; // °C, apparent
  pop: number | null; // precipitation probability 0–100
  rain: number | null; // mm, daily sum if available
  windSpeed: number | null; // km/h
  windDir: number | null; // degrees
  weatherCode: number | null; // WMO code
  condition: string; // human label
};

/**
 * Read-only weather signal for the /tonight day plan.
 *
 * It is deliberately lightweight: two cues only — rain-likely and heat-likely
 * — and they nudge the plan rather than gating it. If the fetch fails, both
 * cues are absent and the plan is unchanged.
 */
export type TonightWeatherSignal = {
  available: boolean;
  rainCue: RainCue | null;
  heatCue: HeatCue | null;
  note: string | null;
};

export type RainCue = (
  | { kind: "likely"; pop: number; dayLabel: string }
  | { kind: "watch"; pop: number; dayLabel: string }
  | null
);

export type HeatCue = (
  | { kind: "very-hot"; tempMax: number; dayLabel: string }
  | { kind: "hot"; tempMax: number; dayLabel: string }
);

const WMO_LABELS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

function conditionFor(code: number | null) {
  if (code == null) return "Unknown";
  return WMO_LABELS[code] ?? `Weather code ${code}`;
}

function lagosIso(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: LAGOS_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .replace(/\//g, "-");
}

function weekdayLong(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    timeZone: LAGOS_TZ,
  }).format(new Date(`${iso}T12:00:00Z`));
}

const fetchJson = async (url: string) => {
  const res = await fetch(url, {
    headers: { "user-agent": "EkoseasonWeather/1.0 (Lagos guide weather card)" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.json() as Promise<{
    latitude: number;
    longitude: number;
    timezone: string;
    daily: {
      time: string[];
      temperature_2m_max: (number | null)[];
      temperature_2m_min: (number | null)[];
      apparent_temperature_max: (number | null)[];
      precipitation_probability_max: (number | null)[];
      precipitation_sum: (number | null)[];
      wind_speed_10m_max: (number | null)[];
      wind_direction_10m_dominant: (number | null)[];
      weathercode: (number | null)[];
    };
  }>;
};

export async function weatherNow(): Promise<WeatherSnapshot> {
  let data: Awaited<ReturnType<typeof fetchJson>>;
  try {
    data = await fetchJson(
      `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${LAGOS_LAT}&longitude=${LAGOS_LON}` +
        `&timezone=${encodeURIComponent(LAGOS_TZ)}` +
        `&forecast_days=8` +
        `&daily=temperature_2m_max,temperature_2m_min,` +
        `apparent_temperature_max,precipitation_probability_max,` +
        `precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant,weathercode`,
    );
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : String(error),
    );
  }

  const days: DayWeather[] = data.daily.time.map((date, i) => ({
    date,
    weekday: weekdayLong(date),
    tempMax: data.daily.temperature_2m_max[i],
    tempMin: data.daily.temperature_2m_min[i],
    tempFeelMax: data.daily.apparent_temperature_max[i],
    pop: data.daily.precipitation_probability_max[i],
    rain: data.daily.precipitation_sum[i],
    windSpeed: data.daily.wind_speed_10m_max[i],
    windDir: data.daily.wind_direction_10m_dominant[i],
    weatherCode: data.daily.weathercode[i],
    condition: conditionFor(data.daily.weathercode[i]),
  }));

  return {
    source: "Open-Meteo (CC BY 4.0)",
    fetchedAt: lagosIso(),
    today: days[0],
    days: days.slice(1, 7), // next six days
    degraded: false,
  };
}

/** Human-readable Lagos summary for the home strip. */
export function weatherStrip(snapshot: WeatherSnapshot) {
  const { today, days } = snapshot;
  const hottest = days.reduce(
    (best, d) =>
      d.tempMax != null && (best.tempMax == null || d.tempMax > best.tempMax)
        ? d
        : best,
    today as DayWeather,
  );
  const wettest = days.reduce(
    (best, d) =>
      d.pop != null && (best.pop == null || d.pop > best.pop) ? d : best,
    today as DayWeather,
  );
  return {
    todayCondition: today.condition,
    todayTemp: today.tempMax,
    todayFeel: today.tempFeelMax,
    todayPop: today.pop,
    hottestDay: hottest.weekday,
    hottestTemp: hottest.tempMax,
    wettestDay: wettest.weekday,
    wettestPop: wettest.pop,
  };
}

const POP_LIKELY = 40;
const POP_WATCH = 15;
const HOT_VERY = 32;
const HOT_WARM = 28;

/**
 * A nudge, not a gate.
 *
 * Picks the rain- and heat-relevant day from the seven-day window and returns
 * short cues the plan can drop into its own copy. When the snapshot is
 * degraded, everything here is null.
 */
export function tonightWeatherSignal(snapshot: WeatherSnapshot): TonightWeatherSignal {
  if (snapshot.degraded) {
    return { available: false, rainCue: null, heatCue: null, note: null };
  }

  const { today, days } = snapshot;
  const week = [today, ...days];

  const rainCue = week.reduce<RainCue>(
    (best, d) => {
      if (d.pop == null) return best;
      const candidate: RainCue =
        d.pop >= POP_LIKELY
          ? { kind: "likely", pop: d.pop, dayLabel: d.weekday }
          : d.pop >= POP_WATCH
            ? { kind: "watch", pop: d.pop, dayLabel: d.weekday }
            : null;
      if (!candidate) return best;
      if (!best) return candidate;
      return candidate.pop > best.pop ? candidate : best;
    },
    null,
  );

  const heatCue: HeatCue | null = week.reduce<HeatCue | null>(
    (best, d) => {
      if (d.tempMax == null) return best;
      if (d.tempMax >= HOT_VERY) {
        const candidate: HeatCue = { kind: "very-hot", tempMax: d.tempMax, dayLabel: d.weekday };
        if (!best) return candidate;
        return candidate.tempMax > best.tempMax ? candidate : best;
      }
      if (d.tempMax >= HOT_WARM) {
        const candidate: HeatCue = { kind: "hot", tempMax: d.tempMax, dayLabel: d.weekday };
        if (!best) return candidate;
        return candidate.tempMax > best.tempMax ? candidate : best;
      }
      return best;
    },
    null,
  );

  const note = buildTonightNote(rainCue, heatCue, today);

  return { available: true, rainCue, heatCue, note };
}

function buildTonightNote(
  rain: RainCue | null,
  heat: HeatCue | null,
  today: DayWeather,
): string | null {
  const parts: string[] = [];

  if (rain?.kind === "likely") {
    parts.push(
      today.date === rain.dayLabel
        ? `Rain is likely today (about ${Math.round(rain.pop)}% chance).`
        : `The wettest day in the next week is ${rain.dayLabel} (about ${Math.round(rain.pop)}% rain).`,
    );
  } else if (rain?.kind === "watch") {
    parts.push(
      today.date === rain.dayLabel
        ? `Rain is possible today (about ${Math.round(rain.pop)}% chance) — worth keeping an eye on.`
        : `${rain.dayLabel} looks like the day to watch for rain (about ${Math.round(rain.pop)}% chance).`,
    );
  }

  if (heat?.kind === "very-hot") {
    parts.push(
      today.date === heat.dayLabel
        ? `It’s very warm today (about ${Math.round(heat.tempMax)}°C) — outdoor plans are better in the morning or late afternoon.`
        : `${heat.dayLabel} is the hottest day in the next week (about ${Math.round(heat.tempMax)}°C).`,
    );
  } else if (heat?.kind === "hot") {
    parts.push(
      today.date === heat.dayLabel
        ? `It’s warm today (about ${Math.round(heat.tempMax)}°C) — fine for daytime, with the peak hours still feeling like Lagos midday.`
        : `${heat.dayLabel} is the warmest day in the next week (about ${Math.round(heat.tempMax)}°C).`,
    );
  }

  return parts.length > 0 ? parts.join(" ") : null;
}
