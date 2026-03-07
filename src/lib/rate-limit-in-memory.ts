import { shouldBypass, RATE_LIMIT_WINDOW_MS } from "./rate-limit-shared";
import type { RateLimitResult } from "./rate-limit-shared";

const store = new Map<string, { count: number; resetAt: number }>();
let lastCleanup = Date.now();
const cleanupInterval = 5 * 60 * 1000;

function cleanupExpiredEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < cleanupInterval) return;
  for (const [key, entry] of store.entries()) {
    if (now >= entry.resetAt) store.delete(key);
  }
  lastCleanup = now;
}

export function inMemoryRateLimit(
  identifier: string,
  limit: number,
  req: Request
): RateLimitResult {
  if (shouldBypass(req)) {
    return {
      ok: true,
      remaining: 999999,
      resetAt: Date.now() + RATE_LIMIT_WINDOW_MS,
      bypassed: true,
    };
  }
  cleanupExpiredEntries();
  const now = Date.now();
  let entry = store.get(identifier);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
    store.set(identifier, entry);
    return { ok: true, remaining: limit - 1, resetAt: entry.resetAt };
  }
  entry.count++;
  if (entry.count > limit) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt };
  }
  return { ok: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}
