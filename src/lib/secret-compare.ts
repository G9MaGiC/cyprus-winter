import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Constant-time string comparison for secrets (portal/admin/cron/health
 * bearer values). Plain `===`/`!==` short-circuits on the first differing
 * byte, which leaks prefix-match timing. Hashing both sides first gives
 * equal-length buffers, so neither content nor length leaks.
 */
export function constantTimeEquals(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a, "utf8").digest();
  const hb = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(ha, hb);
}
