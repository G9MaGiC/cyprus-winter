import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { RateLimitResult } from "./rate-limit-shared";

const limiters = new Map<number, Ratelimit>();

function getLimiter(limit: number): Ratelimit {
  let limiter = limiters.get(limit);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(limit, "1 m"),
      prefix: "cyprus-winter",
    });
    limiters.set(limit, limiter);
  }
  return limiter;
}

export async function redisRateLimit(
  identifier: string,
  limit: number
): Promise<RateLimitResult> {
  const limiter = getLimiter(limit);
  const { success, remaining, reset } = await limiter.limit(identifier);
  return {
    ok: success,
    remaining,
    resetAt: reset,
  };
}
