/**
 * Explicit coverage for the restaurant overlay (data-layer arc, class 7 —
 * the last one). The class is COMPLETE: all 32 restaurants carry
 * `data.restaurants.{id}.*` catalog keys, and the guard asserts full set
 * equality with the data — a new restaurant cannot ship without catalog
 * coverage.
 */

export const LOCALIZED_RESTAURANT_FIELDS = [
  "description",
  "winterTip",
  "bestTimeToVisit",
  "localSecret",
  "openingHours",
  "transport",
  "parking",
  "backstory",
  "culturalNote",
] as const;

export type LocalizedRestaurantField = (typeof LOCALIZED_RESTAURANT_FIELDS)[number];

export const LOCALIZED_RESTAURANT_IDS: ReadonlySet<string> = new Set([
  // Slice 1 (batch 62): first 11 in data order.
  "zygi-tavernas",
  "governors-beach-tavernas",
  "the-polo",
  "the-farmyard",
  "psilo-dendro",
  "polis-harbour",
  "cor-gastronomy",
  "sentio",
  "kakopetria-trout",
  "kouklia-cafe",
  // Slice 2 (batch 63): the next 11 in data order.
  "seasons-oriental",
  "kiti-tavernas",
  "platres-trout",
  "latsi-harbour",
  "nicosia-tavernas",
  "pissouri-tavernas",
  "omodos-tavernas",
  "limassol-marina-restaurants",
  "protaras-tavernas",
  "larnaca-old-town",
  "pafos-harbour",
  // Slice 3 (batch 64): the final 10 — the class completes.
  "agros-tavernas",
  "lefkara-tavernas",
  "kathikas-tavernas",
  "limassol-old-town",
  "kyrenia-tavernas",
  "ayia-napa-tavernas",
  "troodos-square",
  "solea-valley",
  "zygi-mikri",
  "kourion-tavernas",
]);
