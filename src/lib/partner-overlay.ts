import { isCallAheadHours } from "./call-ahead";

export type PartnerOverlay = {
  openingHours?: string;
  imageUrl?: string;
};

/**
 * Partner-edited display fields (AUD-26) — the client-safe half. This module
 * holds only the per-instance cache and synchronous reads, so client
 * components (AttractionCard → place-card-hours) can import it without
 * dragging @supabase/supabase-js into the bundle. The durable store —
 * Supabase hydration and write-through — lives in the server-only
 * partner-overlay-store.ts, which mutates this cache through the two
 * cache-* functions below. On the client the cache is simply empty (as it
 * was before migration 009); server renders bake the applied hours in.
 */
const overlays = new Map<string, PartnerOverlay>();

export function resetPartnerOverlaysForTests(): void {
  overlays.clear();
}

/** Store-internal: replace the whole cache (hydration). */
export function replacePartnerOverlayCache(
  entries: Iterable<readonly [string, PartnerOverlay]>
): void {
  overlays.clear();
  for (const [id, overlay] of entries) overlays.set(id, overlay);
}

/** Store-internal: cache one entry (write-through read-your-writes). */
export function cachePartnerOverlay(providerId: string, overlay: PartnerOverlay): void {
  overlays.set(providerId, overlay);
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
  // Partner hours replace whatever the record carried, so the call-ahead
  // decision must follow the hours actually shown — a stale EN-base flag
  // would say "Call ahead" next to "Open daily 10:00–17:00" (or hide a
  // warning the partner just added).
  return { ...place, openingHours: hours, hoursCallAhead: isCallAheadHours(hours) } as T;
}
