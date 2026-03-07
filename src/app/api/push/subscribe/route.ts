import { NextRequest } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { isPushConfigured } from "@/lib/push";
import { rateLimit } from "@/lib/rate-limit";
import { jsonError, jsonRateLimitedFromResult, rateLimitSuccessHeaders } from "@/lib/api-response";
import { z } from "zod";

const subscribeSchema = z.object({
  clientId: z.string().min(8).max(64),
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
    expirationTime: z.number().nullable().optional(),
  }),
  tripStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  pushTripCountdown: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  if (!isPushConfigured()) {
    return jsonError("SERVICE_UNAVAILABLE", "Push is not configured", 503);
  }

  const limitResult = await rateLimit(req, 5, "push-subscribe");
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

    const { clientId, subscription, tripStartDate, pushTripCountdown = true } = parsed.data;
    const id = `ps-${clientId}`;

    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        id,
        client_id: clientId,
        subscription: subscription as unknown as Record<string, unknown>,
        trip_start_date: tripStartDate ?? null,
        push_trip_countdown: pushTripCountdown,
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
