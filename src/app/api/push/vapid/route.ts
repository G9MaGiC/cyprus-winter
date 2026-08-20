import { getVapidPublicKey, isPushConfigured } from "@/lib/push";
import { rateLimit, type RateLimitResult } from "@/lib/rate-limit";
import {
  jsonError,
  jsonSuccess,
  jsonRateLimitedFromResult,
  rateLimitSuccessHeaders,
} from "@/lib/api-response";

const VAPID_LIMIT = 10;

export async function GET(req: Request) {
  let limitResult: RateLimitResult;
  try {
    limitResult = await rateLimit(req, VAPID_LIMIT, "vapid");
  } catch {
    return jsonError("SERVICE_UNAVAILABLE", "Rate limiting unavailable. Try again in a moment.", 503);
  }
  if (!limitResult.ok) {
    return jsonRateLimitedFromResult("Too many requests. Try again in a minute.", limitResult.resetAt);
  }
  try {
    if (!isPushConfigured()) {
      return jsonError("SERVICE_UNAVAILABLE", "Push not configured", 503);
    }
    const publicKey = getVapidPublicKey();
    if (!publicKey) {
      return jsonError("SERVICE_UNAVAILABLE", "VAPID key missing", 503);
    }
    return jsonSuccess(
      { publicKey },
      { headers: rateLimitSuccessHeaders(limitResult.remaining, VAPID_LIMIT, limitResult.bypassed) }
    );
  } catch {
    return jsonError("SERVICE_UNAVAILABLE", "Push configuration error. Try again in a moment.", 503);
  }
}
