/**
 * Coverage constants for the AUD-10 winery content overlay — separate from
 * winery-content.ts so tests (and any client code) can import them without
 * pulling in the server-only overlay module.
 */

/** The pilot set: the six intended partner wineries (Book-stage converts first). */
export const LOCALIZED_WINERY_IDS: ReadonlySet<string> = new Set([
  "tsiakkas",
  "vouni-panayia",
  "zambartas",
  "kolios",
  "santo",
  "domes-sergiou",
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
