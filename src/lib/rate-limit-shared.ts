export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
  bypassed?: boolean;
};

/** Extract client identifier for rate limiting. */
export function getClientId(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  return ip;
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
