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

async function fetchOpenMeteo(lat: number, lng: number): Promise<{ min: number; max: number } | null> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_min,temperature_2m_max&timezone=Europe/Nicosia&forecast_days=1`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      daily?: { temperature_2m_min?: number[]; temperature_2m_max?: number[] };
    };
    const min = json.daily?.temperature_2m_min?.[0];
    const max = json.daily?.temperature_2m_max?.[0];
    if (min == null || max == null) return null;
    return { min, max };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

export async function getLiveWeather(): Promise<LiveWeather | null> {
  const now = Date.now();
  if (cache && now - cache.updatedAt < CACHE_TTL_MS) {
    return cache.data;
  }

  try {
    const [coastRes, troodosRes] = await Promise.all([
      fetchOpenMeteo(COAST.lat, COAST.lng),
      fetchOpenMeteo(TROODOS.lat, TROODOS.lng),
    ]);

    if (!coastRes || !troodosRes) return cache?.data ?? null;

    const data: LiveWeather = {
      coast: { minC: Math.round(coastRes.min), maxC: Math.round(coastRes.max) },
      troodos: { minC: Math.round(troodosRes.min), maxC: Math.round(troodosRes.max) },
      updatedAt: new Date().toISOString(),
    };

    cache = { data, updatedAt: now };
    return data;
  } catch {
    return cache?.data ?? null;
  }
}
