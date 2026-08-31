/**
 * Rate limiter for API routes. Uses Upstash Redis when configured.
 *
 * Write / abuse-sensitive scopes fail closed in production when Redis is
 * absent. Low-risk public-read scopes may fall back to per-instance
 * in-memory limits so weather, Right Now, and analytics keep working
 * while Upstash is still being wired (BUG-354). `productionReady` and
 * bookings/chat still require distributed Redis.
 */

import {
  getClientId,
  shouldBypass,
  bypassResult,
  type RateLimitResult,
} from "./rate-limit-shared";
import { inMemoryRateLimit } from "./rate-limit-in-memory";
// CI E2E has no external Redis service; see isCiE2eTestMode for the contract.
import { isCiE2eTestMode as isCiE2eTest } from "./test-mode";
import { redisRateLimit } from "./rate-limit-redis";

export type { RateLimitResult } from "./rate-limit-shared";

export type RateLimitScope =
  | "chat"
  | "bookings"
  | "bookings-email"
  | "bookings-lookup"
  | "bookings-lookup-request"
  | "trail-reports"
  | "track"
  | "health"
  | "stats"
  | "push-subscribe"
  | "weather"
  | "vapid"
  | "right-now"
  | "partner";

/** Public-read scopes that may use in-memory limits without Upstash. */
export const MEMORY_FALLBACK_SCOPES: ReadonlySet<RateLimitScope> = new Set([
  "weather",
  "right-now",
  "vapid",
  "health",
  "track",
]);

function hasRedisEnv(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

function allowsMemoryFallback(scope: RateLimitScope): boolean {
  return MEMORY_FALLBACK_SCOPES.has(scope) || isCiE2eTest();
}

const warnedMemoryFallback = new Set<RateLimitScope>();

export async function rateLimit(
  req: Request,
  limit: number,
  scope: RateLimitScope,
  key?: string
): Promise<RateLimitResult> {
  if (shouldBypass(req)) return bypassResult();

  if (
    process.env.NODE_ENV === "production" &&
    !hasRedisEnv() &&
    !allowsMemoryFallback(scope)
  ) {
    throw new Error("Distributed rate limiting is required in production.");
  }

  const identifier = `${scope}:${key?.trim() || getClientId(req)}`;
  if (hasRedisEnv()) {
    return redisRateLimit(identifier, limit);
  }
  if (
    process.env.NODE_ENV === "production" &&
    MEMORY_FALLBACK_SCOPES.has(scope) &&
    !isCiE2eTest() &&
    !warnedMemoryFallback.has(scope)
  ) {
    warnedMemoryFallback.add(scope);
    // console.warn (not logger.warn) — logger is silent in production.
    console.warn(
      `[rate-limit] in-memory fallback for "${scope}" (Upstash not configured)`
    );
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
