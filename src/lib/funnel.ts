/**
 * Conversion funnel counts from conversion_events.
 */
import { getSupabase } from "./supabase";
import { localeFromTrackedProperties } from "./stats-kpi-export";
import {
  countPlanGeography,
  planGeographyRows,
  type PlanGeographyBucket,
} from "./plan-geography";
import { countDiscoverFilters } from "./discover-filter-kpi";

export type FunnelCounts = Record<string, number>;
export type SourceBreakdownRow = { source: string; count: number };
export type EventSourceBreakdown = Record<string, SourceBreakdownRow[]>;

/** Ordered Discover → Plan → Book events counted for admin stats / KPI export. */
export const FUNNEL_ORDER = [
  "page_view",
  "discover_view",
  "trail_view",
  "winery_detail_view",
  "shop_click",
  "plan_view",
  "plan_add",
  "plan_share",
  "hub_footer_click",
  "booking_start",
  "booking_complete",
] as const;

export type FunnelEventName = (typeof FUNNEL_ORDER)[number];

export async function getFunnelCountsThisMonth(): Promise<FunnelCounts> {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return getFunnelCountsSince(start);
}

export async function getFunnelCountsSince(start: Date): Promise<FunnelCounts> {
  return getFunnelCountsInRange(start);
}

export async function getFunnelCountsInRange(start: Date, end?: Date): Promise<FunnelCounts> {
  const supabase = getSupabase();
  if (!supabase) return {};

  const startIso = start.toISOString();
  const endIso = end?.toISOString();

  const results = await Promise.all(
    FUNNEL_ORDER.map(async (event) => {
      let q = supabase
        .from("conversion_events")
        .select("*", { count: "exact", head: true })
        .eq("event", event)
        .gte("created_at", startIso);
      if (endIso) q = q.lt("created_at", endIso);
      const { count, error } = await q;
      if (error) {
        console.error(`Funnel count error for ${event}:`, error);
        return [event, 0] as const;
      }
      return [event, count ?? 0] as const;
    })
  );

  return Object.fromEntries(results);
}

export async function getEventSourceBreakdownThisMonth(
  events: string[]
): Promise<EventSourceBreakdown> {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return getEventSourceBreakdownSince(events, start);
}

export async function getEventSourceBreakdownSince(
  events: string[],
  start: Date
): Promise<EventSourceBreakdown> {
  return getEventSourceBreakdownInRange(events, start);
}

export async function getEventSourceBreakdownInRange(
  events: string[],
  start: Date,
  end?: Date
): Promise<EventSourceBreakdown> {
  const supabase = getSupabase();
  const empty: EventSourceBreakdown = Object.fromEntries(events.map((e) => [e, []]));
  if (!supabase || events.length === 0) return empty;

  const startIso = start.toISOString();
  const endIso = end?.toISOString();

  const PAGE_SIZE = 1000;
  const buckets: Record<string, Record<string, number>> = {};
  for (const event of events) buckets[event] = {};

  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from("conversion_events")
      .select("event, properties")
      .in("event", events)
      .gte("created_at", startIso)
      .range(offset, offset + PAGE_SIZE - 1);
    if (endIso) query = query.lt("created_at", endIso);
    const { data, error } = await query;

    if (error) {
      console.error("Funnel source breakdown query error:", error);
      return empty;
    }

    for (const row of data ?? []) {
      const event = String(row.event || "").trim();
      if (!event || !events.includes(event)) continue;

      const props =
        row.properties && typeof row.properties === "object" && !Array.isArray(row.properties)
          ? (row.properties as Record<string, unknown>)
          : {};

      const sourceRaw = props.source;
      const source =
        typeof sourceRaw === "string" && sourceRaw.trim().length > 0
          ? sourceRaw.trim()
          : "unknown";

      buckets[event][source] = (buckets[event][source] ?? 0) + 1;
    }

    hasMore = (data?.length ?? 0) === PAGE_SIZE;
    offset += PAGE_SIZE;
  }

  const out: EventSourceBreakdown = {};
  for (const event of events) {
    out[event] = Object.entries(buckets[event] ?? {})
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  }
  return out;
}

export type LocaleBreakdownRow = { locale: string; count: number };

/** Locale mix from conversion_events.properties.locale or properties.path — no dedicated column. */
export async function getFunnelLocaleBreakdownInRange(
  start: Date,
  end?: Date
): Promise<LocaleBreakdownRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const startIso = start.toISOString();
  const endIso = end?.toISOString();
  const PAGE_SIZE = 1000;
  const buckets: Record<string, number> = {};

  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from("conversion_events")
      .select("properties")
      .gte("created_at", startIso)
      .range(offset, offset + PAGE_SIZE - 1);
    if (endIso) query = query.lt("created_at", endIso);
    const { data, error } = await query;

    if (error) {
      console.error("Funnel locale breakdown query error:", error);
      return [];
    }

    for (const row of data ?? []) {
      const props =
        row.properties && typeof row.properties === "object" && !Array.isArray(row.properties)
          ? (row.properties as Record<string, unknown>)
          : {};
      const locale = localeFromTrackedProperties(props);
      buckets[locale] = (buckets[locale] ?? 0) + 1;
    }

    hasMore = (data?.length ?? 0) === PAGE_SIZE;
    offset += PAGE_SIZE;
  }

  return Object.entries(buckets)
    .map(([locale, count]) => ({ locale, count }))
    .sort((a, b) => b.count - a.count || a.locale.localeCompare(b.locale));
}

export type PlanGeographyBreakdownRow = { bucket: PlanGeographyBucket; count: number };

/** Rural/mountain vs beach mix from `plan_add` `properties.item_id`. Missing ids count as unknown. */
export async function getPlanGeographyBreakdownInRange(
  start: Date,
  end?: Date
): Promise<PlanGeographyBreakdownRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const startIso = start.toISOString();
  const endIso = end?.toISOString();
  const PAGE_SIZE = 1000;
  const ids: Array<string | undefined> = [];

  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from("conversion_events")
      .select("properties")
      .eq("event", "plan_add")
      .gte("created_at", startIso)
      .range(offset, offset + PAGE_SIZE - 1);
    if (endIso) query = query.lt("created_at", endIso);
    const { data, error } = await query;

    if (error) {
      console.error("Plan geography breakdown query error:", error);
      return [];
    }

    for (const row of data ?? []) {
      const props =
        row.properties && typeof row.properties === "object" && !Array.isArray(row.properties)
          ? (row.properties as Record<string, unknown>)
          : {};
      const itemId = props.item_id;
      ids.push(typeof itemId === "string" ? itemId : undefined);
    }

    hasMore = (data?.length ?? 0) === PAGE_SIZE;
    offset += PAGE_SIZE;
  }

  return planGeographyRows(countPlanGeography(ids));
}

export type DiscoverFilterBreakdownRow = { filter: string; count: number };

/** Discover `?filter=` mix from first-party `discover_filter` events. */
export async function getDiscoverFilterBreakdownInRange(
  start: Date,
  end?: Date
): Promise<DiscoverFilterBreakdownRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const startIso = start.toISOString();
  const endIso = end?.toISOString();
  const PAGE_SIZE = 1000;
  const filters: Array<string | undefined> = [];

  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from("conversion_events")
      .select("properties")
      .eq("event", "discover_filter")
      .gte("created_at", startIso)
      .range(offset, offset + PAGE_SIZE - 1);
    if (endIso) query = query.lt("created_at", endIso);
    const { data, error } = await query;

    if (error) {
      console.error("Discover filter breakdown query error:", error);
      return [];
    }

    for (const row of data ?? []) {
      const props =
        row.properties && typeof row.properties === "object" && !Array.isArray(row.properties)
          ? (row.properties as Record<string, unknown>)
          : {};
      const filter = props.filter;
      filters.push(typeof filter === "string" ? filter : undefined);
    }

    hasMore = (data?.length ?? 0) === PAGE_SIZE;
    offset += PAGE_SIZE;
  }

  return countDiscoverFilters(filters);
}
