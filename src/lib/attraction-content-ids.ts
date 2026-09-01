/**
 * Coverage constants for the AUD-10 attraction content overlay — separate from
 * attraction-content.ts so tests (and any client code) can import them without
 * pulling in the server-only overlay module. Mirrors winery-content-ids.ts.
 */

/** Covered set. Slice 3: flagship in-template places every persona routes
    through. Slice 4 (batch 13): the remaining itinerary-template attractions
    with populated Book-stage fields — full template coverage. */
export const LOCALIZED_ATTRACTION_IDS: ReadonlySet<string> = new Set([
  // Slice 3 — flagship pilot
  "kourion",
  "pafos-mosaics",
  "omodos",
  "lefkara",
  "kykkos",
  "fig-tree-bay",
  "governors-beach",
  "konnos-bay",
  "kakopetria",
  // Slice 4 — remaining template stops
  "coral-bay",
  "tomb-of-kings",
  "choirokoitia",
  "cyprus-museum",
  "leventis-museum",
  "polis",
  "pedoulas",
  "platres",
  "lofou",
  "machairas",
]);

export const LOCALIZED_ATTRACTION_FIELDS = [
  "winterTip",
  "bestTimeToVisit",
  "openingHours",
] as const;

export type LocalizedAttractionField = (typeof LOCALIZED_ATTRACTION_FIELDS)[number];
