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
  // Slice 5 — top non-template attractions by visitor relevance
  "nissi-beach",
  "kolossi",
  "kition",
  "larnaca-aliki",
  "lara-bay",
  "limassol-marina",
  "ayia-napa-sea-caves",
  "st-sozomenos",
  "panagia-asinou",
  "st-john-lampadistis",
  // Slice 7 (batch 16) — painted-church circuit, northern castles, ancient
  "gerakopetra-boulders",
  "panagia-tou-moutoulla",
  "angeloktisti",
  "idalion",
  "archangelos-michail",
  "panagia-tou-araka",
  "st-nicholas-roof",
  "buffavento",
  "st-hilarion",
  "chrysorrogiatissa",
]);

export const LOCALIZED_ATTRACTION_FIELDS = [
  "winterTip",
  "bestTimeToVisit",
  "openingHours",
] as const;

export type LocalizedAttractionField = (typeof LOCALIZED_ATTRACTION_FIELDS)[number];
