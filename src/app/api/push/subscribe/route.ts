import { NextRequest } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { isPushConfigured } from "@/lib/push";
import { rateLimit } from "@/lib/rate-limit";
import { jsonError, jsonRateLimitedFromResult, rateLimitSuccessHeaders } from "@/lib/api-response";
import type { RateLimitResult } from "@/lib/rate-limit";
import { z } from "zod";

const subscribeSchema = z.object({
  clientId: z.string().min(8).max(64),
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string().max(200),
      auth: z.string().max(200),
    }),
    expirationTime: z.number().nullable().optional(),
  }),
  tripStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  pushTripCountdown: z.boolean().optional(),
  pushWeatherDigest: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  if (!isPushConfigured()) {
    return jsonError("SERVICE_UNAVAILABLE", "Push is not configured", 503);
  }

  let limitResult: RateLimitResult;
  try {
    limitResult = await rateLimit(req, 5, "push-subscribe");
  } catch {
    return jsonError("SERVICE_UNAVAILABLE", "Rate limiting unavailable. Try again in a moment.", 503);
  }
  if (!limitResult.ok) {
    return jsonRateLimitedFromResult("Please wait before subscribing again.", limitResult.resetAt);
  }

  const supabase = getSupabase();
  if (!supabase) {
    return jsonError("SERVICE_UNAVAILABLE", "Storage not available", 503);
  }

  try {
    const body = await req.json();
    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid input";
      return jsonError("VALIDATION_ERROR", msg, 400);
    }

    const { clientId, subscription, tripStartDate, pushTripCountdown, pushWeatherDigest } = parsed.data;
    const id = `ps-${clientId}`;

    // Fetch existing row to merge preferences (don't overwrite trip countdown / weather digest)
    const { data: existing } = await supabase
      .from("push_subscriptions")
      .select("push_trip_countdown, push_weather_digest, trip_start_date")
      .eq("id", id)
      .single();

    // Merge: if a preference is explicitly provided use it; otherwise preserve the existing value.
    // This allows opting out while preventing a partial update from one form wiping the other form's setting.
    const merged = {
      push_trip_countdown: pushTripCountdown !== undefined ? pushTripCountdown : (existing?.push_trip_countdown ?? true),
      push_weather_digest: pushWeatherDigest !== undefined ? pushWeatherDigest : (existing?.push_weather_digest ?? false),
      trip_start_date: tripStartDate ?? existing?.trip_start_date ?? null,
    };

    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        id,
        client_id: clientId,
        subscription: subscription as unknown as Record<string, unknown>,
        trip_start_date: merged.trip_start_date,
        push_trip_countdown: merged.push_trip_countdown,
        push_weather_digest: merged.push_weather_digest,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("Push subscription error:", error);
      return jsonError("SERVER_ERROR", "Could not save subscription", 500);
    }

    return Response.json(
      { ok: true },
      { headers: rateLimitSuccessHeaders(limitResult.remaining, 5, limitResult.bypassed) }
    );
  } catch (err) {
    console.error("Push subscribe error:", err);
    return jsonError("SERVER_ERROR", "Internal error", 500);
  }
}
