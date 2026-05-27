/**
 * Conversion funnel counts from conversion_events.
 */
import { getSupabase } from "./supabase";

export type FunnelCounts = Record<string, number>;
export type SourceBreakdownRow = { source: string; count: number };
export type EventSourceBreakdown = Record<string, SourceBreakdownRow[]>;

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

  const FUNNEL_EVENTS = [
    "page_view", "discover_view", "trail_view", "winery_detail_view",
    "plan_add", "booking_start", "booking_confirmed",
  ];

  const results = await Promise.all(
    FUNNEL_EVENTS.map(async (event) => {
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
