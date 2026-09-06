/**
 * Explicit coverage for the winter-event overlay (data-layer arc, class 6).
 * Only ids listed here carry `data.events.{id}.*` catalog keys — everything
 * else falls back to the EN base record. Slice 1 (batch 60) covers the first
 * 13 events in data order; slice 2 takes the remaining 13 and adds the
 * set-equality guard that makes the class complete.
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
]);
