/**
 * Coverage constants for the AUD-10 trail content overlay — separate from
 * trail-content.ts so tests (and any client code) can import them without
 * pulling in the server-only overlay module. Mirrors winery-content-ids.ts
 * and attraction-content-ids.ts.
 */

/** Covered set. Slice 13 (batch 22): the 10 flagship winter trails by
    decision-surface content richness — the pilot for the trail class. */
export const LOCALIZED_TRAIL_IDS: ReadonlySet<string> = new Set([
  "petra-tou-romiou",
  "artemis",
  "olympus-summit",
  "caledonia-falls",
  "adonis",
  "madari-ridge",
  "atalante",
  "avakas-gorge",
  "panagia-araka-stavros",
  "cape-greco",
]);

export const LOCALIZED_TRAIL_FIELDS = [
  "winterNotes",
  "winterSafety",
  "localSecret",
] as const;

export type LocalizedTrailField = (typeof LOCALIZED_TRAIL_FIELDS)[number];
