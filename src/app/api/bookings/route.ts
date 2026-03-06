import { NextRequest } from "next/server";
import { createBooking, getBookingsByEmail } from "@/lib/bookings";
import { rateLimit } from "@/lib/rate-limit";
import { sendBookingConfirmation, sendBookingRequestToWinery } from "@/lib/email";
import { createBookingSchema } from "@/lib/booking-schema";
import { wineries } from "@/data/wineries";
import { z } from "zod";
import { jsonError, jsonRateLimitedFromResult, rateLimitSuccessHeaders } from "@/lib/api-response";
import { sanitizeForStorage } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  const limitResult = rateLimit(req, 10);
  if (!limitResult.ok) {
    return jsonRateLimitedFromResult(
      "Please wait before making another booking.",
      limitResult.resetAt
    );
  }

  try {
    const body = await req.json();
    const parsed = createBookingSchema.safeParse({
      type: body.type ?? "winery_tasting",
      providerId: body.providerId,
      date: body.date,
      partySize: typeof body.partySize === "number" ? body.partySize : Number(body.partySize),
      guestEmail: body.guestEmail,
      guestName: body.guestName,
      notes: body.notes,
    });

    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid input";
      return jsonError("VALIDATION_ERROR", msg, 400);
    }

    const { providerId, date, partySize, guestEmail, guestName, notes } = parsed.data;
    const winery = wineries.find((w) => w.id === providerId);
    if (!winery) {
      return jsonError("NOT_FOUND", "Winery not found", 404);
    }

    const safeGuestName = sanitizeForStorage(guestName);
    if (!safeGuestName) {
      return jsonError("VALIDATION_ERROR", "Guest name is required", 400);
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

    // Optional: send confirmation to guest (no-op if RESEND_API_KEY not set)
    sendBookingConfirmation(booking).catch((e) => {
      console.error("Guest email send failed:", e);
    });

    // Verified partners: notify winery so they can confirm
    if (winery.isVerified && winery.partnerEmail?.trim()) {
      sendBookingRequestToWinery(booking, {
        name: winery.name,
        partnerEmail: winery.partnerEmail.trim(),
      }).catch((e) => {
        console.error("Winery notification send failed:", e);
      });
    }

    return Response.json(
      { booking, message: "Booking request sent. The winery will be in touch." },
      { headers: rateLimitSuccessHeaders(limitResult.remaining, 10) }
    );
  } catch (err) {
    console.error("Booking API error:", err);
    return jsonError(
      "SERVER_ERROR",
      "We couldn't complete your booking. Please try again.",
      500
    );
  }
}

export async function GET(req: NextRequest) {
  const limitResult = rateLimit(req, 15);
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

  try {
    const bookings = await getBookingsByEmail(parsed.data);
    return Response.json(
      { bookings },
      { headers: rateLimitSuccessHeaders(limitResult.remaining, 15) }
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
