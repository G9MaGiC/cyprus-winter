/**
 * Coverage constants for the AUD-10 winery content overlay — separate from
 * winery-content.ts so tests (and any client code) can import them without
 * pulling in the server-only overlay module.
 */

/** Covered set. Slice 1 (pilot): the six intended partner wineries
    (Book-stage converts first). Slice 2 (batch 10): the itinerary-template
    stop plus the five richest-content non-partner wineries by visitor
    relevance. Extend alongside a catalog patch — winery-content.test.ts
    guards every id × field × locale. */
export const LOCALIZED_WINERY_IDS: ReadonlySet<string> = new Set([
  // Slice 1 — partner pilot
  "tsiakkas",
  "vouni-panayia",
  "zambartas",
  "kolios",
  "santo",
  "domes-sergiou",
  // Slice 2 — template stop + high-relevance estates
  "sterna-boutique",
  "vlassides",
  "kyperounta",
  "vasilikon",
  "fikardos",
  "oenou-yi",
]);

export const LOCALIZED_WINERY_FIELDS = [
  "tastingInfo",
  "winterTip",
  "bestTimeToVisit",
  "openingHours",
  "transport",
  "parking",
] as const;

export type LocalizedWineryField = (typeof LOCALIZED_WINERY_FIELDS)[number];
