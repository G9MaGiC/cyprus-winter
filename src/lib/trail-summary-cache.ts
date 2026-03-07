/**
 * Trail summary cache. Cron populates; pages read.
 * In-memory cache with 10min TTL; fallback to stale if Supabase fails.
 */
import { getSupabase } from "./supabase";
import { getLatestReportsByTrail } from "./trail-reports";

const CACHE_KEY = "trail_summary";
const MEMORY_TTL_MS = 10 * 60 * 1000; // 10 minutes
const FETCH_TIMEOUT_MS = 5000; // 5s to avoid blocking page on Vercel

const FEATURED_TRAILS = ["artemis", "caledonia-falls", "atalante", "olympus-summit"] as const;

let memoryCache: { data: TrailSummary; updatedAt: number } | null = null;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), ms)
  );
  return Promise.race([promise, timeout]);
}

export type TrailSummaryEntry = {
  status: "open" | "caution" | "closed";
  surface: "dry" | "muddy" | "snow" | "icy";
  reportedAt?: string;
};

export type TrailSummary = Partial<Record<string, TrailSummaryEntry>>;

export async function getTrailSummary(): Promise<TrailSummary | null> {
  const now = Date.now();
  if (memoryCache && now - memoryCache.updatedAt < MEMORY_TTL_MS) {
    return memoryCache.data;
  }

  const supabase = getSupabase();
  if (!supabase) return memoryCache?.data ?? null;

  try {
    const result = await withTimeout(
      supabase.from("cache").select("value").eq("key", CACHE_KEY).single(),
      FETCH_TIMEOUT_MS
    );
    const { data, error } = result as { data: { value: TrailSummary } | null; error: Error | null };

    if (!error && data?.value) {
      const summary = data.value as TrailSummary;
      memoryCache = { data: summary, updatedAt: now };
      return summary;
    }

    return memoryCache?.data ?? null;
  } catch {
    return memoryCache?.data ?? null;
  }
}

export async function refreshTrailSummary(): Promise<TrailSummary> {
  const summary: TrailSummary = {};

  for (const trailId of FEATURED_TRAILS) {
    const reports = await getLatestReportsByTrail(trailId, 1);
    const latest = reports[0];
    if (latest) {
      summary[trailId] = {
        status: latest.status,
        surface: latest.surface,
        reportedAt: latest.reportedAt,
      };
    }
  }

  const supabase = getSupabase();
  if (supabase) {
    await supabase.from("cache").upsert(
      {
        key: CACHE_KEY,
        value: summary,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );
  }

  memoryCache = { data: summary, updatedAt: Date.now() };
  return summary;
}
