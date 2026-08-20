import { ACTIVITY_FILTER_KEYS } from "@/lib/activity-catalog";
import { PRACTICAL_DISCOVER_FILTERS, filterToSectionId } from "@/lib/discover-sections";

export type DiscoverFilterSource = "discover_filter.filter";

const ALLOWED_FILTERS = new Set<string>([
  ...PRACTICAL_DISCOVER_FILTERS,
  ...ACTIVITY_FILTER_KEYS,
  ...Object.keys(filterToSectionId),
]);

/** Allowlisted Discover `?filter=` values for KPIs. Unknown query junk → other/unknown. */
export function discoverFilterFromProperties(
  properties: Record<string, unknown>
): string {
  const raw = properties.filter;
  if (typeof raw !== "string" || raw.trim().length === 0) return "unknown";
  const key = raw.trim().toLowerCase();
  if (ALLOWED_FILTERS.has(key)) return key;
  return "other";
}

export function countDiscoverFilters(
  filters: Array<string | undefined>
): { filter: string; count: number }[] {
  const buckets: Record<string, number> = {};
  for (const value of filters) {
    const key = discoverFilterFromProperties({ filter: value });
    buckets[key] = (buckets[key] ?? 0) + 1;
  }
  return Object.entries(buckets)
    .map(([filter, count]) => ({ filter, count }))
    .sort((a, b) => b.count - a.count || a.filter.localeCompare(b.filter));
}
