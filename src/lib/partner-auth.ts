import { NextRequest } from "next/server";
import { jsonError } from "@/lib/api-response";
import { findVerifiedPartnerByEmail, type PartnerIdentity } from "@/lib/partner-identity";
import {
  PARTNER_SESSION_COOKIE,
  getPartnerPortalSecret,
  verifyPartnerSessionToken,
} from "@/lib/partner-session";

export function unauthorizedPartner(): Response {
  return jsonError("UNAUTHORIZED", "Unauthorized", 401);
}

export function partnerAuthUnavailable(): Response {
  return jsonError("SERVICE_UNAVAILABLE", "Partner portal is not configured.", 503);
}

export function readPartnerSession(req: NextRequest): PartnerIdentity | null {
  const secret = getPartnerPortalSecret();
  if (!secret) return null;
  const raw = req.cookies.get(PARTNER_SESSION_COOKIE)?.value;
  if (!raw) return null;
  const parsed = verifyPartnerSessionToken(raw, secret);
  if (!parsed) return null;
  const live = findVerifiedPartnerByEmail(parsed.email);
  if (!live || live.providerId !== parsed.providerId) return null;
  return live;
}

export function requirePartner(req: NextRequest): PartnerIdentity | Response {
  if (!getPartnerPortalSecret()) return partnerAuthUnavailable();
  const partner = readPartnerSession(req);
  if (!partner) return unauthorizedPartner();
  return partner;
}

export function isPartnerIdentity(value: PartnerIdentity | Response): value is PartnerIdentity {
  return !(value instanceof Response);
}
