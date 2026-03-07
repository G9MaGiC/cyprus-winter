/**
 * Push subscription queries. Uses Supabase.
 */
import { getSupabase } from "./supabase";
import type { PushSubscriptionJson } from "./push";

export type PushSubscriptionRow = {
  id: string;
  client_id: string;
  subscription: PushSubscriptionJson;
  trip_start_date: string | null;
  push_trip_countdown: boolean;
  push_weather_digest?: boolean;
  last_push_at: string | null;
  last_weather_push_at?: string | null;
};

/** Subscribers due for trip countdown (1–3 days before trip), not yet sent today. */
export async function getSubscribersForTripCountdown(): Promise<PushSubscriptionRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const in1 = new Date(now);
  in1.setDate(in1.getDate() + 1);
  const in2 = new Date(now);
  in2.setDate(in2.getDate() + 2);
  const in3 = new Date(now);
  in3.setDate(in3.getDate() + 3);

  const targetDates = [
    in1.toISOString().slice(0, 10),
    in2.toISOString().slice(0, 10),
    in3.toISOString().slice(0, 10),
  ];

  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("push_trip_countdown", true)
    .in("trip_start_date", targetDates);

  if (error) {
    console.error("Push subscribers query error:", error);
    return [];
  }

  const rows = (data ?? []) as PushSubscriptionRow[];
  return rows.filter(
    (r) => r.last_push_at == null || new Date(r.last_push_at).toISOString() < todayStart
  );
}

export async function markPushSent(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase
    .from("push_subscriptions")
    .update({ last_push_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id);
}

export async function deletePushSubscription(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from("push_subscriptions").delete().eq("id", id);
}

/** Subscribers who want weather digest and haven't received one in the last 6 hours. */
export async function getSubscribersForWeatherDigest(): Promise<PushSubscriptionRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("push_weather_digest", true);

  if (error) {
    console.error("Weather digest subscribers query error:", error);
    return [];
  }

  const rows = (data ?? []) as PushSubscriptionRow[];
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  return rows.filter(
    (r) =>
      r.last_weather_push_at == null || r.last_weather_push_at < sixHoursAgo
  );
}

export async function markWeatherPushSent(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase
    .from("push_subscriptions")
    .update({
      last_weather_push_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
}
