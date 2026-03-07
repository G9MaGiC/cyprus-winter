import { getVapidPublicKey, isPushConfigured } from "@/lib/push";
import { rateLimit } from "@/lib/rate-limit";
import { rateLimitSuccessHeaders } from "@/lib/api-response";

const VAPID_LIMIT = 10;

export async function GET(req: Request) {
  const limitResult = await rateLimit(req, VAPID_LIMIT, "vapid");
  if (!limitResult.ok) {
    return Response.json(
      { error: { code: "RATE_LIMITED" as const, message: "Too many requests. Try again in a minute." } },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((limitResult.resetAt - Date.now()) / 1000)) },
      }
    );
  }
  if (!isPushConfigured()) {
    return Response.json({ error: "Push not configured" }, { status: 503 });
  }
  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    return Response.json({ error: "VAPID key missing" }, { status: 503 });
  }
  return Response.json(
    { publicKey },
    {
      headers: rateLimitSuccessHeaders(limitResult.remaining, VAPID_LIMIT, limitResult.bypassed),
    }
  );
}
