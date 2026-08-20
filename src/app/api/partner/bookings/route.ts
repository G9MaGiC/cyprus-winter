import { NextRequest, NextResponse } from "next/server";
import { jsonError, jsonRateLimitedFromResult } from "@/lib/api-response";
import { getBookingsByProviderId } from "@/lib/bookings";
import { isPartnerIdentity, requirePartner } from "@/lib/partner-auth";
import { rateLimit } from "@/lib/rate-limit";
import type { RateLimitResult } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** List bookings for the signed-in partner's providerId only. */
export async function GET(req: NextRequest) {
  let limitResult: RateLimitResult;
  try {
    limitResult = await rateLimit(req, 60, "partner");
  } catch {
    return jsonError("SERVICE_UNAVAILABLE", "Rate limiting unavailable. Try again in a moment.", 503);
  }
  if (!limitResult.ok) {
    return jsonRateLimitedFromResult("Too many requests", limitResult.resetAt);
  }

  const partner = requirePartner(req);
  if (!isPartnerIdentity(partner)) return partner;

  const bookings = await getBookingsByProviderId(partner.providerId);
  return NextResponse.json({ bookings });
}
