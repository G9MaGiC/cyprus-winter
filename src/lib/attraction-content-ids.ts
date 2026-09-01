/**
 * Coverage constants for the AUD-10 attraction content overlay — separate from
 * attraction-content.ts so tests (and any client code) can import them without
 * pulling in the server-only overlay module. Mirrors winery-content-ids.ts.
 */

/** Slice-3 pilot: flagship in-template places every persona routes through. */
export const LOCALIZED_ATTRACTION_IDS: ReadonlySet<string> = new Set([
  "kourion",
  "pafos-mosaics",
  "omodos",
  "lefkara",
  "kykkos",
  "fig-tree-bay",
  "governors-beach",
  "konnos-bay",
  "kakopetria",
]);

export const LOCALIZED_ATTRACTION_FIELDS = [
  "winterTip",
  "bestTimeToVisit",
  "openingHours",
] as const;

export type LocalizedAttractionField = (typeof LOCALIZED_ATTRACTION_FIELDS)[number];
