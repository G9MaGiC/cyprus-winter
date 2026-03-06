/**
 * Conversion funnel counts from conversion_events.
 */
import { getSupabase } from "./supabase";

export type FunnelCounts = Record<string, number>;

export async function getFunnelCountsThisMonth(): Promise<FunnelCounts> {
  const supabase = getSupabase();
  if (!supabase) return {};

  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const startIso = start.toISOString();

  const { data, error } = await supabase
    .from("conversion_events")
    .select("event")
    .gte("created_at", startIso);

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
