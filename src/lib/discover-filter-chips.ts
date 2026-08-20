import { ACTIVITY_FILTER_KEYS } from "@/lib/activity-catalog";

/** First-class Discover chips (accessibility, family, cycling) — not buried in long lists. */
export const PRACTICAL_DISCOVER_FILTERS = ["family", "accessible", "cycling"] as const;

export type PracticalDiscoverFilter = (typeof PRACTICAL_DISCOVER_FILTERS)[number];

export function buildDiscoverFilterChipGroups(sectionIds: string[]): {
  practical: readonly PracticalDiscoverFilter[];
  places: string[];
  moods: string[];
} {
  const buried = new Set(["coasts", "family", "accessible"]);
  return {
    practical: PRACTICAL_DISCOVER_FILTERS,
    places: sectionIds.filter((id) => !buried.has(id)),
    moods: ACTIVITY_FILTER_KEYS.filter((id) => id !== "cycling"),
  };
}
