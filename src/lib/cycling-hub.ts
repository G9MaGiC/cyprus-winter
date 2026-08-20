import type { DiscoverItem } from "@/data/discover";
import { allDiscoverItems } from "@/data/discover";
import { buildActivitySection } from "@/lib/activity-catalog";

export function getCyclingHubContent(items: DiscoverItem[] = allDiscoverItems) {
  const section = buildActivitySection("cycling", items);
  return {
    places: section?.items ?? [],
    trailLinks: section?.trailLinks ?? [],
  };
}
