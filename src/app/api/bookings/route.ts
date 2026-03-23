import { createBooking, getBookingsByEmail } from "@/lib/bookings";
import { hasSupabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { sendBookingConfirmation, sendBookingRequestToWinery, sendBookingRequestToGuide } from "@/lib/email";
import { createBookingSchema } from "@/lib/booking-schema";
import { wineries } from "@/data/wineries";
import { guides } from "@/data/guides";
import { trails } from "@/data/trails";
import { z } from "zod";
import { jsonError, jsonRateLimitedFromResult, rateLimitSuccessHeaders, parseJsonBody } from "@/lib/api-response";
import type { RateLimitResult } from "@/lib/rate-limit";
import { sanitizeForStorage } from "@/lib/sanitize";

export async function POST(req: Request) {
  let limitResult: RateLimitResult;
  try {
    limitResult = await rateLimit(req, 10, "bookings");
  } catch {
    return jsonError("SERVICE_UNAVAILABLE", "Rate limiting unavailable. Try again in a moment.", 503);
  }
  if (!limitResult.ok) {
    return jsonRateLimitedFromResult(
      "Please wait before making another booking.",
      limitResult.resetAt
    );
  }

  try {
    const body = await parseJsonBody(req, 10 * 1024); // 10KB max for bookings
    if (body instanceof Response) return body;
    const parsed = createBookingSchema.safeParse({
      type: body.type ?? "winery_tasting",
      providerId: body.providerId,
      date: body.date,
      partySize: typeof body.partySize === "number" ? body.partySize : Number(body.partySize),
      guestEmail: body.guestEmail,
      guestName: body.guestName,
      notes: body.notes,
      trailId: body.trailId,
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
        { headers: rateLimitSuccessHeaders(limitResult.remaining, 10, limitResult.bypassed) }
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
        { headers: rateLimitSuccessHeaders(limitResult.remaining, 10, limitResult.bypassed) }
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
  let limitResult: RateLimitResult;
  try {
    limitResult = await rateLimit(req, 15, "bookings-lookup");
  } catch {
    return jsonError("SERVICE_UNAVAILABLE", "Rate limiting unavailable. Try again in a moment.", 503);
  }
  if (!limitResult.ok) {
    return jsonRateLimitedFromResult(
      "Please wait before checking your bookings again.",
      limitResult.resetAt
    );
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) {
    return jsonError("BAD_REQUEST", "email required", 400);
  }
  const parsed = z.string().email().max(254).safeParse(email);
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Invalid email format", 400);
  }

  // Require a lookup token (HMAC of email) to prevent enumeration attacks.
  // Client generates this from a short-lived token issued at booking time.
  const token = searchParams.get("token");
  if (!token) {
    return jsonError("BAD_REQUEST", "Lookup token required", 400);
  }
  const secret = process.env.BOOKING_LOOKUP_SECRET;
  if (secret) {
    const crypto = await import("crypto");
    const expected = crypto.createHmac("sha256", secret).update(parsed.data.toLowerCase()).digest("hex");
    // Constant-time comparison to prevent timing attacks
    const tokenBuf = Buffer.from(token);
    const expectedBuf = Buffer.from(expected);
    if (tokenBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(tokenBuf, expectedBuf)) {
      return jsonError("BAD_REQUEST", "Invalid lookup token", 403);
    }
  }

  try {
    const bookings = await getBookingsByEmail(parsed.data);
    return Response.json(
      { bookings },
      { headers: rateLimitSuccessHeaders(limitResult.remaining, 15, limitResult.bypassed) }
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
