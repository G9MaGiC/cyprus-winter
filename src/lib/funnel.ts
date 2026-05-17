/**
 * Conversion funnel counts from conversion_events.
 */
import { getSupabase } from "./supabase";
import { fetchAllSupabaseRows } from "./supabase-pagination";

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

  const { data, error } = await fetchAllSupabaseRows<{ event: string }>(() => {
    let query = supabase
      .from("conversion_events")
      .select("event")
      .gte("created_at", startIso);
    if (endIso) query = query.lt("created_at", endIso);
    return query;
  });

  if (error) {
    console.error("Funnel query error:", error);
    return {};
  }

  const counts: FunnelCounts = {};
  for (const row of data ?? []) {
    const e = String(row.event || "").trim();
    if (e) counts[e] = (counts[e] ?? 0) + 1;
  }
  return counts;
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

  const { data, error } = await fetchAllSupabaseRows<{
    event: string;
    properties: Record<string, unknown> | null;
  }>(() => {
    let query = supabase
      .from("conversion_events")
      .select("event, properties")
      .in("event", events)
      .gte("created_at", startIso);
    if (endIso) query = query.lt("created_at", endIso);
    return query;
  });

  if (error) {
    console.error("Funnel source breakdown query error:", error);
    return empty;
  }

  const buckets: Record<string, Record<string, number>> = {};
  for (const event of events) buckets[event] = {};

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

  const out: EventSourceBreakdown = {};
  for (const event of events) {
    out[event] = Object.entries(buckets[event] ?? {})
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  }
  return out;
}
