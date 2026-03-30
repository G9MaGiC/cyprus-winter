import { createBooking, getBookingsByEmail } from "@/lib/bookings";
import { hasSupabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import {
  sendBookingConfirmation,
  sendBookingLookupTokenEmail,
  sendBookingRequestToWinery,
  sendBookingRequestToGuide,
} from "@/lib/email";
import { createBookingSchema } from "@/lib/booking-schema";
import { wineries } from "@/data/wineries";
import { guides } from "@/data/guides";
import { trails } from "@/data/trails";
import { z } from "zod";
import { jsonError, jsonRateLimitedFromResult, rateLimitSuccessHeaders } from "@/lib/api-response";
import type { RateLimitResult } from "@/lib/rate-limit";
import { sanitizeForStorage } from "@/lib/sanitize";
import { createBookingLookupToken, verifyBookingLookupToken } from "@/lib/booking-lookup-token";

const lookupRequestSchema = z.object({
  action: z.literal("request_lookup_token"),
  email: z.string().email().max(254),
});

const genericLookupResponse = {
  message: "If an account exists for that email, we'll send a secure lookup link shortly.",
};

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "Invalid JSON body", 400);
  }

  const lookupRequest = lookupRequestSchema.safeParse(body);
  if (lookupRequest.success) {
    let lookupRateLimit: RateLimitResult;
    try {
      lookupRateLimit = await rateLimit(req, 5, "bookings-lookup-request");
    } catch {
      return jsonError("SERVICE_UNAVAILABLE", "Rate limiting unavailable. Try again in a moment.", 503);
    }

    if (!lookupRateLimit.ok) {
      return jsonRateLimitedFromResult(
        "Please wait before requesting another booking lookup link.",
        lookupRateLimit.resetAt
      );
    }

    const normalizedEmail = lookupRequest.data.email.trim().toLowerCase();

    try {
      const token = createBookingLookupToken(normalizedEmail, { ttlSeconds: 15 * 60 });
      await sendBookingLookupTokenEmail(normalizedEmail, token);
    } catch (err) {
      console.error("Booking lookup token request error:", err);
    }

    return Response.json(genericLookupResponse, {
      headers: rateLimitSuccessHeaders(lookupRateLimit.remaining, 5, lookupRateLimit.bypassed),
    });
  }

  let bookingRateLimit: RateLimitResult;
  try {
    bookingRateLimit = await rateLimit(req, 10, "bookings");
  } catch {
    return jsonError("SERVICE_UNAVAILABLE", "Rate limiting unavailable. Try again in a moment.", 503);
  }
  if (!bookingRateLimit.ok) {
    return jsonRateLimitedFromResult(
      "Please wait before making another booking.",
      bookingRateLimit.resetAt
    );
  }

  try {
    const parsed = createBookingSchema.safeParse({
      type: (body as Record<string, unknown>).type ?? "winery_tasting",
      providerId: (body as Record<string, unknown>).providerId,
      date: (body as Record<string, unknown>).date,
      partySize:
        typeof (body as Record<string, unknown>).partySize === "number"
          ? (body as Record<string, unknown>).partySize
          : Number((body as Record<string, unknown>).partySize),
      guestEmail: (body as Record<string, unknown>).guestEmail,
      guestName: (body as Record<string, unknown>).guestName,
      notes: (body as Record<string, unknown>).notes,
      trailId: (body as Record<string, unknown>).trailId,
    });

    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid input";
      return jsonError("VALIDATION_ERROR", msg, 400);
    }

    const { type, providerId, date, partySize, guestEmail, guestName, notes, trailId } = parsed.data;
    const safeGuestName = sanitizeForStorage(guestName);
    if (!safeGuestName) {
      return jsonError("VALIDATION_ERROR", "Guest name is required", 400);
    }

    if (type === "winery_tasting") {
      const winery = wineries.find((w) => w.id === providerId);
      if (!winery) {
        return jsonError("NOT_FOUND", "Winery not found", 404);
      }
      const booking = await createBooking({
        type: "winery_tasting",
        providerId,
        providerName: winery.name,
        date,
        partySize,
        guestEmail,
        guestName: safeGuestName,
        notes: notes != null ? sanitizeForStorage(notes) : undefined,
        leadFeeEur: winery.partnerLeadFeeEur,
      });

      let confirmationSent = false;
      let wineryNotificationSent = false;
      try {
        confirmationSent = await sendBookingConfirmation(booking);
      } catch (e) {
        console.error("Guest email send failed:", e);
      }
      if (winery.isVerified && winery.partnerEmail?.trim()) {
        try {
          wineryNotificationSent = await sendBookingRequestToWinery(booking, {
            name: winery.name,
            partnerEmail: winery.partnerEmail.trim(),
          });
        } catch (e) {
          console.error("Winery notification send failed:", e);
        }
      }
      return Response.json(
        {
          booking,
          message: "Booking request sent. The winery will be in touch.",
          storage: hasSupabase() ? "database" : "memory",
          emailStatus: {
            confirmationSent,
            ...(winery.isVerified && winery.partnerEmail?.trim()
              ? { wineryNotificationSent }
              : {}),
          },
        },
        { headers: rateLimitSuccessHeaders(bookingRateLimit.remaining, 10, bookingRateLimit.bypassed) }
      );
    }

    if (type === "guide_tour") {
      const guide = guides.find((g) => g.id === providerId);
      if (!guide) {
        return jsonError("NOT_FOUND", "Guide not found", 404);
      }
      const trail = trailId ? trails.find((t) => t.id === trailId || t.slug === trailId) : undefined;
      const notesWithTrail =
        trailId && trail
          ? (notes ? `${notes}\nTrail: ${trail.name}` : `Trail: ${trail.name}`)
          : notes;
      const booking = await createBooking({
        type: "guide_tour",
        providerId,
        providerName: guide.name,
        date,
        partySize,
        guestEmail,
        guestName: safeGuestName,
        notes: notesWithTrail != null ? sanitizeForStorage(notesWithTrail) : undefined,
        leadFeeEur: guide.partnerLeadFeeEur,
      });

      let confirmationSent = false;
      let guideNotificationSent = false;
      try {
        confirmationSent = await sendBookingConfirmation(booking);
      } catch (e) {
        console.error("Guest email send failed:", e);
      }
      if (guide.isVerified && guide.partnerEmail?.trim()) {
        try {
          guideNotificationSent = await sendBookingRequestToGuide(
            booking,
            { name: guide.name, partnerEmail: guide.partnerEmail.trim() },
            trail?.name
          );
        } catch (e) {
          console.error("Guide notification send failed:", e);
        }
      }
      return Response.json(
        {
          booking,
          message: "Booking request sent. The guide will be in touch.",
          storage: hasSupabase() ? "database" : "memory",
          emailStatus: {
            confirmationSent,
            ...(guide.isVerified && guide.partnerEmail?.trim()
              ? { guideNotificationSent }
              : {}),
          },
        },
        { headers: rateLimitSuccessHeaders(bookingRateLimit.remaining, 10, bookingRateLimit.bypassed) }
      );
    }

    return jsonError("VALIDATION_ERROR", "Invalid booking type", 400);
  } catch (err) {
    console.error("Booking API error:", err);
    return jsonError(
      "SERVER_ERROR",
      "We couldn't complete your booking. Please try again.",
      500
    );
  }
}

export async function GET(req: Request) {
  let lookupLimitResult: RateLimitResult;
  try {
    lookupLimitResult = await rateLimit(req, 15, "bookings-lookup");
  } catch {
    return jsonError("SERVICE_UNAVAILABLE", "Rate limiting unavailable. Try again in a moment.", 503);
  }
  if (!lookupLimitResult.ok) {
    return jsonRateLimitedFromResult(
      "Please wait before checking your bookings again.",
      lookupLimitResult.resetAt
    );
  }

  let verifyLimitResult: RateLimitResult;
  try {
    verifyLimitResult = await rateLimit(req, 25, "bookings-lookup-verify");
  } catch {
    return jsonError("SERVICE_UNAVAILABLE", "Rate limiting unavailable. Try again in a moment.", 503);
  }
  if (!verifyLimitResult.ok) {
    return jsonRateLimitedFromResult(
      "Please wait before trying another booking lookup.",
      verifyLimitResult.resetAt
    );
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const token = searchParams.get("token");
  if (!email || !token) {
    return jsonError("BAD_REQUEST", "email and token required", 400);
  }

  const parsed = z.string().email().max(254).safeParse(email);
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Invalid email format", 400);
  }

  try {
    const verification = verifyBookingLookupToken(token, parsed.data);
    if (!verification.ok) {
      return jsonError("FORBIDDEN", "Invalid or expired lookup token", 403);
    }

    const bookings = await getBookingsByEmail(parsed.data);
    const remaining = Math.min(lookupLimitResult.remaining, verifyLimitResult.remaining);
    return Response.json(
      { bookings },
      { headers: rateLimitSuccessHeaders(remaining, 15, lookupLimitResult.bypassed || verifyLimitResult.bypassed) }
    );
  } catch (err) {
    console.error("Bookings GET error:", err);
    return jsonError(
      "SERVER_ERROR",
      "We couldn't load your bookings. Try again, or add them manually.",
      500
    );
  }
}
