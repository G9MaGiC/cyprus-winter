import { createHmac, timingSafeEqual } from "crypto";

/** HttpOnly cookie name for admin UI (stats). Pair with POST /api/admin/session. */
export const ADMIN_SESSION_COOKIE = "cw_admin_sess";

const MAX_AGE_SEC = 7 * 24 * 60 * 60;

/** Signed token (base64url). Payload: `<expUnix>.<hex-hmac>`. */
export function createAdminSessionToken(adminSecret: string): string {
  const expSec = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const sig = createHmac("sha256", adminSecret)
    .update(`cw-admin:${expSec}`)
    .digest("hex");
  const raw = `${expSec}.${sig}`;
  return Buffer.from(raw, "utf8").toString("base64url");
}

export function verifyAdminSessionToken(token: string, adminSecret: string): boolean {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const dot = raw.indexOf(".");
    if (dot < 0) return false;
    const expSec = parseInt(raw.slice(0, dot), 10);
    const sig = raw.slice(dot + 1);
    if (Number.isNaN(expSec) || expSec < Date.now() / 1000) return false;
    const expected = createHmac("sha256", adminSecret)
      .update(`cw-admin:${expSec}`)
      .digest("hex");
    if (sig.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(sig, "utf8"), Buffer.from(expected, "utf8"));
  } catch {
    return false;
  }
}
