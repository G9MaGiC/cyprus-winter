/**
 * Rate limiter for API routes. Uses Upstash Redis when configured.
 * Production intentionally fails closed if the distributed limiter is absent.
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

function hasRedisEnv(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

export async function rateLimit(
  req: Request,
  limit: number,
  scope: RateLimitScope
): Promise<RateLimitResult> {
  if (shouldBypass(req)) return bypassResult();

  if (process.env.NODE_ENV === "production" && !hasRedisEnv()) {
    throw new Error("Distributed rate limiting is required in production.");
  }

  const identifier = `${scope}:${getClientId(req)}`;
  if (hasRedisEnv()) {
    return redisRateLimit(identifier, limit);
  }
  return inMemoryRateLimit(identifier, limit, req);
}

export function rateLimitHeaders(
  remaining: number,
  resetAt: number,
  bypassed?: boolean
): Record<string, string> {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  const headers: Record<string, string> = {
    "Cache-Control": "no-store",
    "X-RateLimit-Remaining": String(Math.max(0, remaining)),
    "Retry-After": String(Math.max(1, retryAfter)),
  };
  if (bypassed) {
    headers["X-RateLimit-Bypassed"] = "true";
  }
  return headers;
}
