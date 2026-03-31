import { rateLimit } from "@/lib/rate-limit";
import { jsonError, jsonRateLimitedFromResult, rateLimitSuccessHeaders } from "@/lib/api-response";
import type { RateLimitResult } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

const SUBSCRIBE_LIMIT = process.env.NODE_ENV === "development" ? 30 : 5;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let limitResult: RateLimitResult;
  try {
    limitResult = await rateLimit(req, SUBSCRIBE_LIMIT, "subscribe");
  } catch {
    return jsonError("SERVICE_UNAVAILABLE", "Try again in a moment.", 503);
  }
  if (!limitResult.ok) {
    return jsonRateLimitedFromResult("Please wait before trying again.", limitResult.resetAt);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "Invalid JSON body", 400);
  }

  if (!body || typeof body !== "object") {
    return jsonError("VALIDATION_ERROR", "Invalid request body", 400);
  }

  const { email, source } = body as Record<string, unknown>;
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return jsonError("VALIDATION_ERROR", "Valid email is required", 400);
  }

  const cleanEmail = sanitizeText(email.trim().toLowerCase(), 256);
  const cleanSource = typeof source === "string" ? sanitizeText(source, 64) : "lead-magnet";

  // Log subscription (Supabase integration can be added when table exists)
  console.log(`[subscribe] ${cleanEmail} source=${cleanSource}`);

  const headers = rateLimitSuccessHeaders(limitResult.remaining, SUBSCRIBE_LIMIT, limitResult.bypassed);
  return Response.json(
    { ok: true, message: "You're on the list." },
    { status: 200, headers }
  );
}
