/**
 * Rate limiter for API routes. Uses Upstash Redis when UPSTASH_REDIS_REST_URL
 * and UPSTASH_REDIS_REST_TOKEN are set; otherwise falls back to in-memory.
 *
 * In-memory limitations: limits are per-instance (not shared across serverless),
 * reset on deploy. Use Redis for production multi-instance deployments.
 */

import {
  getClientId,
  shouldBypass,
  bypassResult,
  type RateLimitResult,
} from "./rate-limit-shared";
import { inMemoryRateLimit } from "./rate-limit-in-memory";
import { redisRateLimit } from "./rate-limit-redis";

export type { RateLimitResult } from "./rate-limit-shared";

/** Scope for per-route limits (each route gets its own bucket per IP). */
export type RateLimitScope =
  | "chat"
  | "bookings"
  | "bookings-lookup"
  | "trail-reports"
  | "track"
  | "health"
  | "stats"
  | "push-subscribe"
  | "weather"
  | "vapid"
  | "right-now";

let redisWarningLogged = false;

function hasRedisEnv(): boolean {
  const available = !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
  if (!available && process.env.NODE_ENV === "production" && !redisWarningLogged) {
    redisWarningLogged = true;
    console.warn("[rate-limit] Redis env vars missing in production — falling back to in-memory rate limiting (not shared across instances)");
  }
  return available;
}

/**
 * Check rate limit. Uses Redis when env vars are set, else in-memory.
 * @param scope - Route identifier so limits are per-route (chat vs bookings etc.)
 */
export async function rateLimit(
  req: Request,
  limit: number,
  scope: RateLimitScope
): Promise<RateLimitResult> {
  if (shouldBypass(req)) return bypassResult();
  const identifier = `${scope}:${getClientId(req)}`;
  if (hasRedisEnv()) {
    return redisRateLimit(identifier, limit);
  }
  return inMemoryRateLimit(identifier, limit, req);
}

/** Build headers for a successful rate-limited response. */
export function rateLimitHeaders(
  remaining: number,
  resetAt: number,
  bypassed?: boolean
): Record<string, string> {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  const headers: Record<string, string> = {
    "X-RateLimit-Remaining": String(Math.max(0, remaining)),
    "Retry-After": String(Math.max(1, retryAfter)),
  };
  if (bypassed) {
    headers["X-RateLimit-Bypassed"] = "true";
  }
  return headers;
}
