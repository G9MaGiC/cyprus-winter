/**
 * Simple in-memory rate limiter for API routes.
 * 
 * ⚠️ PRODUCTION NOTE: This implementation uses in-memory storage which has
 * limitations for multi-instance deployments (e.g., Vercel, AWS Lambda):
 * 
 * 1. Rate limits are NOT shared across serverless instances
 * 2. Memory usage grows with unique client IPs
 * 3. Rate limit state resets on each deployment
 * 
 * For production with high traffic, use Redis (Upstash) or Vercel KV:
 * @see https://upstash.com/docs/redis/sdks/ratelimit
 * 
 * Current implementation includes automatic cleanup of expired entries
 * to prevent memory leaks.
 */

// Configuration
const windowMs = 60 * 1000; // 1 minute
const store = new Map<string, { count: number; resetAt: number }>();
let lastCleanup = Date.now();
const cleanupInterval = 5 * 60 * 1000; // Cleanup every 5 minutes

// Stress testing bypass (only for development/testing)
const STRESS_TEST_TOKEN = process.env.STRESS_TEST_TOKEN;
const isDev = process.env.NODE_ENV === 'development';

/** Remove expired entries to prevent memory leaks */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < cleanupInterval) return;
  
  for (const [key, entry] of store.entries()) {
    if (now >= entry.resetAt) {
      store.delete(key);
    }
  }
  lastCleanup = now;
}

function getClientId(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  return ip;
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
  bypassed?: boolean;
};

/**
 * Check if request should bypass rate limiting (for stress testing)
 */
function shouldBypass(req: Request): boolean {
  // Only allow bypass in development or with explicit stress test token
  if (!isDev && !STRESS_TEST_TOKEN) return false;
  
  const bypassHeader = req.headers.get("x-stress-test");
  if (bypassHeader === STRESS_TEST_TOKEN) return true;
  
  // In development, also accept a simple flag for local testing
  if (isDev && bypassHeader === "bypass") return true;
  
  return false;
}

export function rateLimit(req: Request, limit: number): RateLimitResult {
  // Check for bypass
  if (shouldBypass(req)) {
    return { ok: true, remaining: 999999, resetAt: Date.now() + windowMs, bypassed: true };
  }
  
  // Periodic cleanup to prevent memory leaks
  cleanupExpiredEntries();
  
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
