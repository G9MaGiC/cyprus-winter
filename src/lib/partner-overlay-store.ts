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
    writing instance reads its own write immediately.

    Partial patches must not clobber omitted fields. The in-memory cache is
    empty on a cold isolate, so merging from it and upserting both columns
    would write `image_url: null` on a hours-only save. Read the durable row
    when Supabase is configured, and only send columns the caller patched
    (PostgREST upsert updates listed columns only). */
export async function setPartnerOverlay(
  providerId: string,
  patch: PartnerOverlay
): Promise<PartnerOverlay> {
  const supabase = getSupabase();
  let current: PartnerOverlay = getPartnerOverlay(providerId) ?? {};

  if (supabase) {
    const { data, error: readError } = await supabase
      .from("partner_overlays")
      .select("opening_hours,image_url")
      .eq("provider_id", providerId)
      .maybeSingle();
    if (readError) {
      console.error("Partner overlay read failed:", readError.message, { providerId });
      throw new Error(readError.message);
    }
    if (data) {
      current = {};
      if (data.opening_hours) current.openingHours = String(data.opening_hours);
      if (data.image_url) current.imageUrl = String(data.image_url);
    }
  }

  const next: PartnerOverlay = { ...current };
  const row: {
    provider_id: string;
    updated_at: string;
    opening_hours?: string | null;
    image_url?: string | null;
  } = {
    provider_id: providerId,
    updated_at: new Date().toISOString(),
  };

  if (typeof patch.openingHours === "string") {
    next.openingHours = patch.openingHours.trim().slice(0, 500);
    row.opening_hours = next.openingHours || null;
  }
  if (typeof patch.imageUrl === "string") {
    next.imageUrl = patch.imageUrl.trim();
    row.image_url = next.imageUrl || null;
  }

  if (supabase) {
    const { error } = await supabase.from("partner_overlays").upsert(row);
    if (error) {
      console.error("Partner overlay upsert failed:", error.message, { providerId });
      throw new Error(error.message);
    }
  }

  cachePartnerOverlay(providerId, next);
  return next;
}
