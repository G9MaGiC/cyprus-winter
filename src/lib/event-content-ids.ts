/**
 * Explicit coverage for the winter-event overlay (data-layer arc, class 6).
 * The class is COMPLETE: all 26 events carry `data.events.{id}.*` catalog
 * keys, and the guard asserts full set equality with the data — a new event
 * cannot ship without catalog coverage.
 */

export const LOCALIZED_EVENT_FIELDS = ["name", "description", "dates", "venue"] as const;
export type LocalizedEventField = (typeof LOCALIZED_EVENT_FIELDS)[number];

export const LOCALIZED_EVENT_IDS: ReadonlySet<string> = new Set([
  // Slice 1 (batch 60): first 13 in data order.
  "limassol-carnival",
  "nicosia-winter-festival",
  "pafos-xmas-market",
  "commandaria-festival",
  "troodos-ski-season",
  "lefkara-lace-festival",
  "bellapais-concerts",
  "agros-rose-festival-prep",
  "larnaca-xmas-village",
  "cyprus-marathon",
  "kakopetria-christmas-village",
  "kyperounta-christmas-village",
  "ayia-napa-cultural-winter",
  // Slice 2 (batch 61): the remaining 13 — the class completes.
  "ayia-napa-winter-swimming",
  "kalopanagiotis-christmas-village",
  "omodos-christmas-market",
  "lania-christmas",
  "green-monday",
  "famagusta-carnival",
  "deryneia-christmas-village",
  "statos-agios-fotios-christmas",
  "cyprus-jazz-world-music-showcase",
  "peloponnese-wine-festival",
  "portfolio-wine-tasting",
  "protaras-christmas",
  "epiphany-cyprus",
]);
