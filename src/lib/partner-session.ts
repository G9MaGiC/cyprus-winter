import { createHmac, timingSafeEqual } from "crypto";
import type { PartnerIdentity } from "./partner-identity";

/** HttpOnly cookie for the partner portal. Pair with POST /api/partner/session. */
export const PARTNER_SESSION_COOKIE = "cw_partner_sess";

export const PARTNER_SESSION_MAX_AGE_SEC = 7 * 24 * 60 * 60;
const MAX_AGE_SEC = PARTNER_SESSION_MAX_AGE_SEC;

export function partnerSessionCookieOptions(maxAge = PARTNER_SESSION_MAX_AGE_SEC) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

function sign(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function getPartnerPortalSecret(): string | null {
  const s = process.env.PARTNER_PORTAL_SECRET;
  return s && s.length >= 16 ? s : null;
}

/** Signed token: newline-separated exp, providerId, kind, email, hmac — then base64url. */
export function createPartnerSessionToken(partner: PartnerIdentity, secret: string): string {
  const expSec = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const payload = `cw-partner:${expSec}:${partner.providerId}:${partner.kind}:${partner.email}`;
  const raw = [String(expSec), partner.providerId, partner.kind, partner.email, sign(secret, payload)].join(
    "\n"
  );
  return Buffer.from(raw, "utf8").toString("base64url");
}

export function verifyPartnerSessionToken(
  token: string,
  secret: string
): PartnerIdentity | null {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const parts = raw.split("\n");
    if (parts.length !== 5) return null;
    const [expRaw, providerId, kind, email, sig] = parts;
    const expSec = parseInt(expRaw ?? "", 10);
    if (!providerId || !email || (kind !== "winery" && kind !== "guide")) return null;
    if (Number.isNaN(expSec) || expSec < Date.now() / 1000) return null;
    const payload = `cw-partner:${expSec}:${providerId}:${kind}:${email}`;
    const expected = sign(secret, payload);
    if (!sig || sig.length !== expected.length) return null;
    if (!timingSafeEqual(Buffer.from(sig, "utf8"), Buffer.from(expected, "utf8"))) return null;
    return { providerId, providerName: "", kind, email };
  } catch {
    return null;
  }
}
