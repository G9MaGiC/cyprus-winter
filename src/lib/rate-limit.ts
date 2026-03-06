/**
 * Simple in-memory rate limiter for API routes.
 * Use Upstash/Vercel KV for production multi-instance deployments.
 */
const windowMs = 60 * 1000; // 1 minute
const store = new Map<string, { count: number; resetAt: number }>();

function getClientId(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  return ip;
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

export function rateLimit(req: Request, limit: number): RateLimitResult {
  const key = getClientId(req);
  const now = Date.now();
  let entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return { ok: true, remaining: limit - 1, resetAt: entry.resetAt };
  }

  entry.count++;
  if (entry.count > limit) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt };
  }
  return { ok: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/** Build headers for a successful rate-limited response. */
export function rateLimitHeaders(remaining: number, resetAt: number): HeadersInit {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  return {
    "X-RateLimit-Remaining": String(Math.max(0, remaining)),
    "Retry-After": String(Math.max(1, retryAfter)),
  };
}
