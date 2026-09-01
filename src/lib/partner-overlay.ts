import { getSupabase, hasSupabase } from "./supabase";

export type PartnerOverlay = {
  openingHours?: string;
  imageUrl?: string;
};

/**
 * Partner-edited display fields (AUD-26). Reads stay synchronous — every
 * consumer renders inside a request — while the backing store is Supabase
 * since migration 009: `setPartnerOverlay` writes through to the
 * `partner_overlays` table, and `ensurePartnerOverlaysLoaded()` hydrates the
 * per-instance cache (TTL'd) at each overlay-consuming server entry point.
 * Without Supabase (dev/tests) the cache alone is the store, which preserves
 * the previous in-memory behavior exactly.
 */
const overlays = new Map<string, PartnerOverlay>();
let lastLoadedAt = 0;
const CACHE_TTL_MS = 60_000;

export function resetPartnerOverlaysForTests(): void {
  overlays.clear();
  lastLoadedAt = 0;
}

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
  overlays.clear();
  for (const row of data ?? []) {
    const overlay: PartnerOverlay = {};
    if (row.opening_hours) overlay.openingHours = String(row.opening_hours);
    if (row.image_url) overlay.imageUrl = String(row.image_url);
    overlays.set(String(row.provider_id), overlay);
  }
  lastLoadedAt = now;
}

export function getPartnerOverlay(providerId: string): PartnerOverlay | undefined {
  return overlays.get(providerId);
}

/** Live winter hours from the partner overlay, if the partner set them. */
export function partnerOpeningHours(providerId: string): string | undefined {
  const hours = overlays.get(providerId)?.openingHours?.trim();
  return hours || undefined;
}

export function applyPartnerOpeningHours<T extends { id: string; openingHours?: string }>(place: T): T {
  const hours = partnerOpeningHours(place.id);
  if (!hours) return place;
  return { ...place, openingHours: hours };
}

/** Write-through: the durable row first (when Supabase is configured — a
    failed upsert throws so the caller can surface it), then the cache so the
    writing instance reads its own write immediately. */
export async function setPartnerOverlay(
  providerId: string,
  patch: PartnerOverlay
): Promise<PartnerOverlay> {
  const current = overlays.get(providerId) ?? {};
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

  overlays.set(providerId, next);
  return next;
}
