import { getVapidPublicKey, isPushConfigured } from "@/lib/push";
import { rateLimit, type RateLimitResult } from "@/lib/rate-limit";
import { jsonError, rateLimitSuccessHeaders } from "@/lib/api-response";

const VAPID_LIMIT = 10;

export async function GET(req: Request) {
  let limitResult: RateLimitResult;
  try {
    limitResult = await rateLimit(req, VAPID_LIMIT, "vapid");
  } catch {
    return jsonError("SERVICE_UNAVAILABLE", "Rate limiting unavailable. Try again in a moment.", 503);
  }
  if (!limitResult.ok) {
    return Response.json(
      { error: { code: "RATE_LIMITED" as const, message: "Too many requests. Try again in a minute." } },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((limitResult.resetAt - Date.now()) / 1000)) },
      }
    );
  }
  try {
    if (!isPushConfigured()) {
      return jsonError("SERVICE_UNAVAILABLE", "Push not configured", 503);
    }
    const publicKey = getVapidPublicKey();
    if (!publicKey) {
      return jsonError("SERVICE_UNAVAILABLE", "VAPID key missing", 503);
    }
    return Response.json(
      { publicKey },
      {
        headers: rateLimitSuccessHeaders(limitResult.remaining, VAPID_LIMIT, limitResult.bypassed),
      }
    );
  } catch {
    return jsonError("SERVICE_UNAVAILABLE", "Push configuration error. Try again in a moment.", 503);
  }
}
