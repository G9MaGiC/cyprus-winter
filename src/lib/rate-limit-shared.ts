export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
  bypassed?: boolean;
};

/** Extract client identifier for rate limiting. Prefers x-real-ip (set by trusted proxies like Vercel/nginx). */
export function getClientId(req: Request): string {
  // x-real-ip is set by the trusted reverse proxy and cannot be spoofed by the client
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  // Fallback: rightmost X-Forwarded-For entry (appended by the first trusted proxy)
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",");
    return parts[parts.length - 1].trim();
  }
  return "unknown";
}

/** Check if request should bypass rate limiting. Only in local development. */
export function shouldBypass(req: Request): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  return req.headers.get("x-stress-test") === "bypass";
}

export const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export function bypassResult(): RateLimitResult {
  return {
    ok: true,
    remaining: 999999,
    resetAt: Date.now() + RATE_LIMIT_WINDOW_MS,
    bypassed: true,
  };
}
