import { NextRequest, NextResponse } from "next/server";
import { jsonError, jsonRateLimitedFromResult } from "@/lib/api-response";
import { updateBookingStatus, type BookingStatus } from "@/lib/bookings";
import { isPartnerIdentity, requirePartner } from "@/lib/partner-auth";
import { rateLimit } from "@/lib/rate-limit";
import type { RateLimitResult } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Accept or decline a tasting/tour request that belongs to the signed-in partner. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let limitResult: RateLimitResult;
  try {
    limitResult = await rateLimit(req, 30, "partner");
  } catch {
    return jsonError("SERVICE_UNAVAILABLE", "Rate limiting unavailable. Try again in a moment.", 503);
  }
  if (!limitResult.ok) {
    return jsonRateLimitedFromResult("Too many requests", limitResult.resetAt);
  }

  const partner = requirePartner(req);
  if (!isPartnerIdentity(partner)) return partner;

  const { id } = await params;
  if (!id) {
    return jsonError("VALIDATION_ERROR", "Booking id is required.", 400);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "Invalid JSON body", 400);
  }

  const status =
    typeof body === "object" &&
    body !== null &&
    "status" in body &&
    typeof (body as { status?: unknown }).status === "string"
      ? (body as { status: string }).status
      : "";

  if (status !== "confirmed" && status !== "cancelled") {
    return jsonError("VALIDATION_ERROR", "Status must be confirmed or cancelled.", 400);
  }

  const result = await updateBookingStatus(id, status as BookingStatus, partner.providerId);
  if ("error" in result) {
    if (result.error === "forbidden") {
      return jsonError("FORBIDDEN", "Forbidden", 403);
    }
    if (result.error === "invalid_transition") {
      return jsonError(
        "INVALID_TRANSITION",
        "This booking can no longer change to that status. Refresh to see its current state.",
        409
      );
    }
    if (result.error === "conflict") {
      return jsonError(
        "CONFLICT",
        "This booking was updated by another request. Refresh and try again.",
        409
      );
    }
    return jsonError("NOT_FOUND", "Booking not found.", 404);
  }

  return NextResponse.json({ booking: result.booking });
}
