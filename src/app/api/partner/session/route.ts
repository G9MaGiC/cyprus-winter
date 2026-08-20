import { NextRequest, NextResponse } from "next/server";
import { jsonError, jsonRateLimitedFromResult } from "@/lib/api-response";
import { findVerifiedPartnerByEmail } from "@/lib/partner-identity";
import {
  PARTNER_SESSION_COOKIE,
  createPartnerSessionToken,
  getPartnerPortalSecret,
  partnerSessionCookieOptions,
} from "@/lib/partner-session";
import { partnerAuthUnavailable, readPartnerSession, unauthorizedPartner } from "@/lib/partner-auth";
import { rateLimit } from "@/lib/rate-limit";
import type { RateLimitResult } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

async function limitPartner(req: NextRequest, limit: number): Promise<RateLimitResult | Response> {
  let limitResult: RateLimitResult;
  try {
    limitResult = await rateLimit(req, limit, "partner");
  } catch {
    return jsonError("SERVICE_UNAVAILABLE", "Rate limiting unavailable. Try again in a moment.", 503);
  }
  if (!limitResult.ok) {
    return jsonRateLimitedFromResult("Too many requests", limitResult.resetAt);
  }
  return limitResult;
}

/** Ping: returns 200 if the HttpOnly partner session cookie is valid. */
export async function GET(req: NextRequest) {
  const limited = await limitPartner(req, 60);
  if (limited instanceof Response) return limited;

  if (!getPartnerPortalSecret()) return partnerAuthUnavailable();
  const partner = readPartnerSession(req);
  if (!partner) return unauthorizedPartner();

  return NextResponse.json({
    ok: true,
    partner: {
      providerId: partner.providerId,
      providerName: partner.providerName,
      kind: partner.kind,
      email: partner.email,
    },
  });
}

/** Exchange verified partner email + PARTNER_PORTAL_SECRET for an HttpOnly session cookie. */
export async function POST(req: NextRequest) {
  const limited = await limitPartner(req, 10);
  if (limited instanceof Response) return limited;

  const secret = getPartnerPortalSecret();
  if (!secret) return partnerAuthUnavailable();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "Invalid JSON body", 400);
  }

  const email =
    typeof body === "object" &&
    body !== null &&
    "email" in body &&
    typeof (body as { email?: unknown }).email === "string"
      ? (body as { email: string }).email.trim()
      : "";
  const token =
    typeof body === "object" &&
    body !== null &&
    "secret" in body &&
    typeof (body as { secret?: unknown }).secret === "string"
      ? (body as { secret: string }).secret.trim()
      : "";

  if (!token || token !== secret) {
    return unauthorizedPartner();
  }

  const partner = findVerifiedPartnerByEmail(email);
  if (!partner) {
    return unauthorizedPartner();
  }

  const value = createPartnerSessionToken(partner, secret);
  const res = NextResponse.json({
    ok: true,
    partner: {
      providerId: partner.providerId,
      providerName: partner.providerName,
      kind: partner.kind,
      email: partner.email,
    },
  });
  res.cookies.set(PARTNER_SESSION_COOKIE, value, partnerSessionCookieOptions());
  return res;
}

/** Clear partner session cookie (logout). */
export async function DELETE(req: NextRequest) {
  try {
    const limitResult = await rateLimit(req, 30, "partner");
    if (!limitResult.ok) {
      return jsonRateLimitedFromResult("Too many requests", limitResult.resetAt);
    }
  } catch {
    // Logout still allowed if rate limiter fails
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PARTNER_SESSION_COOKIE, "", partnerSessionCookieOptions(0));
  return res;
}
