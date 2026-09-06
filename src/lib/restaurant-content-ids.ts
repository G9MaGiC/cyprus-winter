/**
 * Explicit coverage for the restaurant overlay (data-layer arc, class 7 —
 * the last one). Only ids listed here carry `data.restaurants.{id}.*`
 * catalog keys (guarded by restaurant-content.test.ts across all 7
 * locales); everything else falls back to the EN base record until its
 * slice lands.
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
  "santo-restaurant",
  "kouklia-cafe",
]);
