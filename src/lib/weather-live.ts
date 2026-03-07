/**
 * Live weather from Open-Meteo (free, no key).
 * Cached 1 hour; fallback to null when fetch fails.
 */
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const COAST = { lat: 34.68, lng: 33.04 }; // Larnaca/Limassol
const TROODOS = { lat: 34.96, lng: 32.83 }; // Pedoulas/Troodos

export type LiveWeather = {
  coast: { minC: number; maxC: number };
  troodos: { minC: number; maxC: number };
  updatedAt: string;
};

let cache: { data: LiveWeather; updatedAt: number } | null = null;

const FETCH_TIMEOUT_MS = 6000; // 6s to avoid blocking page on Vercel

/** Weather at specific coordinates (for Right Now feed). */
export type WeatherAtCoords = {
  minC: number;
  maxC: number;
  precipitationMm: number; // daily sum; > 0 indicates rain
  updatedAt: string;
};

/** In-memory cache for coords-based weather (key: "lat,lng" rounded to 2 decimals) */
const coordsCache = new Map<string, { data: WeatherAtCoords; updatedAt: number }>();

async function fetchOpenMeteo(lat: number, lng: number): Promise<{ min: number; max: number; precipitation: number } | null> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_min,temperature_2m_max,precipitation_sum&timezone=Europe/Nicosia&forecast_days=1`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      daily?: {
        temperature_2m_min?: number[];
        temperature_2m_max?: number[];
        precipitation_sum?: number[];
      };
    };
    const min = json.daily?.temperature_2m_min?.[0];
    const max = json.daily?.temperature_2m_max?.[0];
    const precipitation = json.daily?.precipitation_sum?.[0] ?? 0;
    if (min == null || max == null) return null;
    return { min, max, precipitation };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

const OVERALL_TIMEOUT_MS = 8000; // Max wait to avoid blocking page on Vercel

export async function getLiveWeather(): Promise<LiveWeather | null> {
  const now = Date.now();
  if (cache && now - cache.updatedAt < CACHE_TTL_MS) {
    return cache.data;
  }

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("weather_timeout")), OVERALL_TIMEOUT_MS)
  );

  try {
    const data = await Promise.race([
      (async () => {
        const [coastRes, troodosRes] = await Promise.all([
          fetchOpenMeteo(COAST.lat, COAST.lng),
          fetchOpenMeteo(TROODOS.lat, TROODOS.lng),
        ]);

        if (!coastRes || !troodosRes) return cache?.data ?? null;

        const out: LiveWeather = {
          coast: { minC: Math.round(coastRes.min), maxC: Math.round(coastRes.max) },
          troodos: { minC: Math.round(troodosRes.min), maxC: Math.round(troodosRes.max) },
          updatedAt: new Date().toISOString(),
        };

        cache = { data: out, updatedAt: Date.now() };
        return out;
      })(),
      timeoutPromise,
    ]);
    return data;
  } catch {
    return cache?.data ?? null;
  }
}

/**
 * Get weather at user coordinates (for Right Now feed).
 * Cached 1h per lat,lng (rounded to 2 decimals to avoid cache fragmentation).
 */
export async function getWeatherAtCoords(lat: number, lng: number): Promise<WeatherAtCoords | null> {
  const key = `${Math.round(lat * 100) / 100},${Math.round(lng * 100) / 100}`;
  const now = Date.now();
  const cached = coordsCache.get(key);
  if (cached && now - cached.updatedAt < CACHE_TTL_MS) return cached.data;

  const res = await fetchOpenMeteo(lat, lng);
  if (!res) return cached?.data ?? null;

  const data: WeatherAtCoords = {
    minC: Math.round(res.min),
    maxC: Math.round(res.max),
    precipitationMm: res.precipitation,
    updatedAt: new Date().toISOString(),
  };
  coordsCache.set(key, { data, updatedAt: now });
  return data;
}
