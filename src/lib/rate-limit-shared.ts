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

const STRESS_TEST_TOKEN = process.env.STRESS_TEST_TOKEN;
const isDev = process.env.NODE_ENV === "development";

/** Check if request should bypass rate limiting (stress testing). Never in production. */
export function shouldBypass(req: Request): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (!isDev && !STRESS_TEST_TOKEN) return false;
  const bypassHeader = req.headers.get("x-stress-test");
  if (bypassHeader === STRESS_TEST_TOKEN) return true;
  if (isDev && bypassHeader === "bypass") return true;
  return false;
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
