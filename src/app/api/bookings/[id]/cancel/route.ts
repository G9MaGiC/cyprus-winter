import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  jsonError,
  jsonRateLimitedFromResult,
  rateLimitSuccessHeaders,
  readJsonBody,
  RequestBodyTooLargeError,
} from "@/lib/api-response";
import { cancelBookingAsGuest } from "@/lib/bookings";
import { sendCancellationNoticeToPartner, sendGuestCancellationEmail } from "@/lib/email";
import { getGuideById } from "@/data/guides";
import { getWineryById } from "@/data/wineries";
import { isPartnerVerified } from "@/lib/partner-verification";
import { rateLimit } from "@/lib/rate-limit";
import type { RateLimitResult } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const cancelSchema = z.object({
  guestEmail: z.string().trim().email().max(254),
});

/**
 * Guest-initiated cancellation. Authorization is possession of the booking id
 * plus the exact guest email it was created with; an email mismatch answers
 * the same 404 as a missing booking so ids cannot be probed. Idempotent: a
 * second cancel is a 200 no-op and re-sends no email.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let limitResult: RateLimitResult;
  try {
    limitResult = await rateLimit(req, 10, "booking-cancel");
  } catch {
    return jsonError("SERVICE_UNAVAILABLE", "Rate limiting unavailable. Try again in a moment.", 503);
  }
  if (!limitResult.ok) {
    return jsonRateLimitedFromResult("Too many requests", limitResult.resetAt);
  }

  const { id } = await params;
  if (!id) {
    return jsonError("VALIDATION_ERROR", "Booking id is required.", 400);
  }

  // Bounded read: this is a public, unauthenticated endpoint — the same
  // memory-pressure guard the sibling POST /api/bookings enforces.
  let body: unknown;
  try {
    body = await readJsonBody(req, 4_000);
  } catch (err) {
    if (err instanceof RequestBodyTooLargeError) {
      return jsonError("VALIDATION_ERROR", "Request body too large.", 413);
    }
    return jsonError("VALIDATION_ERROR", "Invalid JSON body", 400);
  }
  const parsed = cancelSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "A valid guestEmail is required.", 400);
  }

  const result = await cancelBookingAsGuest(id, parsed.data.guestEmail);
  if ("error" in result) {
    if (result.error === "invalid_transition") {
      return jsonError(
        "INVALID_TRANSITION",
        "This booking can no longer be cancelled. Refresh to see its current state.",
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

  // Side effects only on a real transition — the idempotent no-op retry must
  // not re-send. Email failures never fail the cancellation.
  let guestEmailSent = false;
  let partnerNotified = false;
  if (result.changed) {
    guestEmailSent = await sendGuestCancellationEmail(result.booking, result.booking.locale);
    // Partner notice only where a confirmed contact route exists — the same
    // isPartnerVerified + partnerEmail gate the request notifications use.
    const provider =
      result.booking.type === "guide_tour"
        ? getGuideById(result.booking.providerId)
        : getWineryById(result.booking.providerId);
    if (provider && isPartnerVerified(provider) && provider.partnerEmail?.trim()) {
      partnerNotified = await sendCancellationNoticeToPartner(result.booking, {
        name: provider.name,
        partnerEmail: provider.partnerEmail.trim(),
      });
    }
  }

  return NextResponse.json(
    {
      booking: result.booking,
      changed: result.changed,
      guestEmailSent,
      partnerNotified,
    },
    // no-store: the response carries guest PII; the X-RateLimit headers are
    // the contract for all rate-limited routes (api-response.ts).
    { headers: rateLimitSuccessHeaders(limitResult.remaining, 10, limitResult.bypassed) }
  );
}
