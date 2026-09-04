import "server-only";
import { getSupabase, hasSupabase } from "./supabase";
import {
  cachePartnerOverlay,
  getPartnerOverlay,
  replacePartnerOverlayCache,
  type PartnerOverlay,
} from "./partner-overlay";

/**
 * Durable side of the partner overlay (AUD-26 / migration 009). Server-only:
 * hydrates the client-safe cache in partner-overlay.ts from the
 * partner_overlays table and writes edits through to it. Without Supabase
 * (dev, tests) the cache alone is the store — the pre-009 behavior exactly.
 */
let lastLoadedAt = 0;
const CACHE_TTL_MS = 60_000;

/** Hydrate the overlay cache from Supabase when configured and stale.
    Fail-open: a load error keeps whatever the cache already holds. */
export async function ensurePartnerOverlaysLoaded(): Promise<void> {
  if (!hasSupabase()) return;
  const now = Date.now();
  if (now - lastLoadedAt < CACHE_TTL_MS) return;
  const supabase = getSupabase();
  if (!supabase) return;
  const { data, error } = await supabase
    .from("partner_overlays")
    .select("provider_id,opening_hours,image_url");
  if (error) {
    console.error("Partner overlay load failed:", error.message);
    return;
  }
  replacePartnerOverlayCache(
    (data ?? []).map((row) => {
      const overlay: PartnerOverlay = {};
      if (row.opening_hours) overlay.openingHours = String(row.opening_hours);
      if (row.image_url) overlay.imageUrl = String(row.image_url);
      return [String(row.provider_id), overlay] as const;
    })
  );
  lastLoadedAt = now;
}

/** Write-through: the durable row first (when Supabase is configured — a
    failed upsert throws so the caller can surface it), then the cache so the
    writing instance reads its own write immediately. */
export async function setPartnerOverlay(
  providerId: string,
  patch: PartnerOverlay
): Promise<PartnerOverlay> {
  const current = getPartnerOverlay(providerId) ?? {};
  const next: PartnerOverlay = { ...current };
  if (typeof patch.openingHours === "string") {
    next.openingHours = patch.openingHours.trim().slice(0, 500);
  }
  if (typeof patch.imageUrl === "string") {
    next.imageUrl = patch.imageUrl.trim();
  }

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from("partner_overlays").upsert({
      provider_id: providerId,
      opening_hours: next.openingHours ?? null,
      image_url: next.imageUrl ?? null,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error("Partner overlay upsert failed:", error.message, { providerId });
      throw new Error(error.message);
    }
  }

  cachePartnerOverlay(providerId, next);
  return next;
}
