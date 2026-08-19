export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
  bypassed?: boolean;
};

function normalizeClientId(value: string | null): string | null {
  const normalized = value?.split(",")[0]?.trim().replace(/^"|"$/g, "");
  if (!normalized || normalized.length > 128) return null;
  return normalized;
}

/**
 * Extract a client identifier.
 *
 * The deployment edge must overwrite the trusted headers below. We prefer
 * platform-specific headers and never trust the first user-controlled
 * X-Forwarded-For hop.
 */
export function getClientId(req: Request): string {
  const trustedHeaders = ["x-vercel-forwarded-for", "cf-connecting-ip", "x-real-ip"];
  for (const header of trustedHeaders) {
    const value = normalizeClientId(req.headers.get(header));
    if (value) return value;
  }

  const forwarded = req.headers.get("x-forwarded-for");
  const chain = forwarded
    ?.split(",")
    .map((value) => normalizeClientId(value))
    .filter((value): value is string => Boolean(value));
  if (chain && chain.length > 0) {
    // The closest proxy-added hop is safer than the first, which clients can
    // commonly inject. Configure a trusted platform header for per-client limits.
    return chain[chain.length - 1];
  }

  return "unknown";
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
