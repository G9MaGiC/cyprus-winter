import { createHash } from "node:crypto";
import { BookingIdempotencyConflictError, createBooking, getBookingsByEmail } from "@/lib/bookings";
import { getSupabase, hasSupabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { sendBookingConfirmation, sendBookingRequestToWinery, sendBookingRequestToGuide, sendBookingLookupTokenEmail } from "@/lib/email";
import { createBookingSchema } from "@/lib/booking-schema";
import { wineries } from "@/data/wineries";
import { guides } from "@/data/guides";
import { findTrailByIdOrSlug } from "@/lib/trail-resolve";
import { z } from "zod";
import {
  jsonError,
  jsonSuccess,
  jsonRateLimitedFromResult,
  rateLimitSuccessHeaders,
  readJsonBody,
  RequestBodyTooLargeError,
} from "@/lib/api-response";
import type { RateLimitResult } from "@/lib/rate-limit";
import { sanitizeForStorage } from "@/lib/sanitize";
import { isCiE2eTestMode } from "@/lib/test-mode";
import { isPartnerVerified } from "@/lib/partner-verification";
import {
  createBookingLookupToken,
  isBookingLookupTokenConfigured,
  verifyBookingLookupToken,
} from "@/lib/booking-lookup-token";

const MAX_BOOKING_BODY_BYTES = 32_000;

const lookupRequestSchema = z.object({
  action: z.literal("request_lookup_token"),
  email: z.string().email().max(254),
  locale: z.string().max(8).optional(),
});

const genericLookupResponse = {
  message: "If an account exists for that email, we'll send a secure lookup link shortly.",
};

function getBearerToken(req: Request): string | null {
  const header = req.headers.get("authorization")?.trim();
  if (!header || !/^Bearer\s+/i.test(header)) return null;
  const token = header.replace(/^Bearer\s+/i, "").trim();
  return token || null;
}

function publicBookingView(booking: Awaited<ReturnType<typeof getBookingsByEmail>>[number]) {
  return {
    id: booking.id,
    type: booking.type,
    providerId: booking.providerId,
    providerName: booking.providerName,
    date: booking.date,
    partySize: booking.partySize,
    status: booking.status,
    createdAt: booking.createdAt,
  };
}

async function recordTrustedBookingEvent(
  booking: Awaited<ReturnType<typeof createBooking>>["booking"]
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase.from("conversion_events").insert({
    event: "booking_complete",
    properties: {
      source: "booking_api",
      booking_id: booking.id,
      booking_type: booking.type,
      provider_id: booking.providerId,
      party_size: booking.partySize,
    },
    session_id: null,
  });
  if (error) console.error("Trusted booking conversion event failed:", error);
}

async function authorizeBookingLookup(
  req: Request,
  emailNormalized: string,
  lookupToken: string | null
): Promise<Response | null> {
  if (hasSupabase()) {
    const supabase = getSupabase();
    const accessToken = getBearerToken(req);
    if (supabase && accessToken) {
      const { data, error } = await supabase.auth.getUser(accessToken);
      const userEmail = data.user?.email?.trim().toLowerCase();
      const emailConfirmed = Boolean(data.user?.email_confirmed_at);
      if (!error && userEmail && userEmail === emailNormalized && emailConfirmed) {
        return null;
      }
    }
  }

  if (lookupToken) {
    if (!isBookingLookupTokenConfigured()) {
      return jsonError("SERVICE_UNAVAILABLE", "Booking lookup is not configured.", 503);
    }
    const verification = verifyBookingLookupToken(lookupToken, emailNormalized);
    if (!verification.ok) {
      return jsonError("FORBIDDEN", "Invalid or expired lookup token", 403);
    }
    return null;
  }

  if (hasSupabase()) {
    return jsonError("UNAUTHORIZED", "Sign in to load your bookings.", 401);
  }

  return null;
}

async function handleLookupTokenRequest(req: Request, email: string, locale?: string): Promise<Response> {
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

  const normalizedEmail = email.trim().toLowerCase();
  try {
    if (isBookingLookupTokenConfigured()) {
      const token = createBookingLookupToken(normalizedEmail, { ttlSeconds: 15 * 60 });
      await sendBookingLookupTokenEmail(normalizedEmail, token, locale);
    }
  } catch (err) {
    console.error("Booking lookup token request error:", err);
  }

  return jsonSuccess(genericLookupResponse, {
    headers: rateLimitSuccessHeaders(lookupRateLimit.remaining, 5, lookupRateLimit.bypassed),
  });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await readJsonBody(req, MAX_BOOKING_BODY_BYTES);
  } catch (err) {
    if (err instanceof RequestBodyTooLargeError) {
      return jsonError("PAYLOAD_TOO_LARGE", "Booking payload is too large.", 413);
    }
    return jsonError("VALIDATION_ERROR", "Invalid JSON body", 400);
  }

  const lookupRequest = lookupRequestSchema.safeParse(body);
  if (lookupRequest.success) {
    return handleLookupTokenRequest(req, lookupRequest.data.email, lookupRequest.data.locale);
  }

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
  if (process.env.NODE_ENV === "production" && !hasSupabase() && !isCiE2eTestMode()) {
    // Fail closed in real production; CI E2E production builds fall back to
    // the in-memory store (same double-flag contract as rate limiting).
    return jsonError("SERVICE_UNAVAILABLE", "Booking storage is not configured.", 503);
  }

  try {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonError("VALIDATION_ERROR", "Invalid input", 400);
    }
    const raw = body as Record<string, unknown>;
    if (typeof raw.website === "string" && raw.website.trim()) {
      return jsonSuccess(
        { booking: null, stored: false, message: "Thanks for the request." },
        { headers: rateLimitSuccessHeaders(limitResult.remaining, 10, limitResult.bypassed) }
      );
    }
    const parsed = createBookingSchema.safeParse({
      type: raw.type ?? "winery_tasting",
      providerId: raw.providerId,
      date: raw.date,
      idempotencyKey: raw.idempotencyKey,
      partySize: typeof raw.partySize === "number" ? raw.partySize : Number(raw.partySize),
      guestEmail: raw.guestEmail,
      guestName: raw.guestName,
      notes: raw.notes,
      trailId: raw.trailId,
      locale: raw.locale,
    });

    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid input";
      return jsonError("VALIDATION_ERROR", msg, 400);
    }

    const { type, providerId, date, idempotencyKey, partySize, guestEmail, guestName, notes, trailId } = parsed.data;
    const safeGuestName = sanitizeForStorage(guestName);
    if (!safeGuestName) {
      return jsonError("VALIDATION_ERROR", "Guest name is required", 400);
    }

    const emailRateLimitKey = createHash("sha256")
      .update(guestEmail.trim().toLowerCase())
      .digest("hex");
    let emailLimitResult: RateLimitResult;
    try {
      emailLimitResult = await rateLimit(req, 10, "bookings-email", emailRateLimitKey);
    } catch {
      return jsonError("SERVICE_UNAVAILABLE", "Rate limiting unavailable. Try again in a moment.", 503);
    }
    if (!emailLimitResult.ok) {
      return jsonRateLimitedFromResult(
        "Please wait before making another booking with this email address.",
        emailLimitResult.resetAt
      );
    }
    const successLimitRemaining = Math.min(limitResult.remaining, emailLimitResult.remaining);

    if (type === "winery_tasting") {
      const winery = wineries.find((w) => w.id === providerId);
      if (!winery) {
        return jsonError("NOT_FOUND", "Winery not found", 404);
      }
      const result = await createBooking({
        type: "winery_tasting",
        providerId,
        providerName: winery.name,
        date,
        partySize,
        guestEmail,
        guestName: safeGuestName,
        notes: notes != null ? sanitizeForStorage(notes) : undefined,
        leadFeeEur: winery.partnerLeadFeeEur,
        idempotencyKey,
      });
      const { booking, created } = result;

      let confirmationSent = false;
      let wineryNotificationSent = false;
      if (created) {
        await recordTrustedBookingEvent(booking);
        try {
          confirmationSent = await sendBookingConfirmation(booking, parsed.data.locale);
        } catch (e) {
          console.error("Guest email send failed:", e);
        }
        if (isPartnerVerified(winery) && winery.partnerEmail?.trim()) {
          try {
            wineryNotificationSent = await sendBookingRequestToWinery(booking, {
              name: winery.name,
              partnerEmail: winery.partnerEmail.trim(),
            });
          } catch (e) {
            console.error("Winery notification send failed:", e);
          }
        }
      }

      return jsonSuccess(
        {
          booking,
          message: created
            ? "Booking request sent. The winery will be in touch."
            : "This booking request was already received.",
          replayed: !created,
          storage: hasSupabase() ? "database" : "memory",
          emailStatus: {
            confirmationSent,
            ...(isPartnerVerified(winery) && winery.partnerEmail?.trim()
              ? { wineryNotificationSent }
              : {}),
          },
        },
        { headers: rateLimitSuccessHeaders(successLimitRemaining, 10, limitResult.bypassed || emailLimitResult.bypassed) }
      );
    }

    if (type === "guide_tour") {
      const guide = guides.find((g) => g.id === providerId);
      if (!guide) {
        return jsonError("NOT_FOUND", "Guide not found", 404);
      }
      const trail = trailId ? findTrailByIdOrSlug(trailId) : undefined;
      const notesWithTrail =
        trailId && trail
          ? (notes ? `${notes}\nTrail: ${trail.name}` : `Trail: ${trail.name}`)
          : notes;
      const result = await createBooking({
        type: "guide_tour",
        providerId,
        providerName: guide.name,
        date,
        partySize,
        guestEmail,
        guestName: safeGuestName,
        notes: notesWithTrail != null ? sanitizeForStorage(notesWithTrail) : undefined,
        // Structured field for the client (AUD-86); the notes fold above stays
        // for email readability and DB rows (no trail_id column yet).
        trailId: trail?.id,
        leadFeeEur: guide.partnerLeadFeeEur,
        idempotencyKey,
      });
      const { booking, created } = result;

      let confirmationSent = false;
      let guideNotificationSent = false;
      if (created) {
        await recordTrustedBookingEvent(booking);
        try {
          confirmationSent = await sendBookingConfirmation(booking, parsed.data.locale);
        } catch (e) {
          console.error("Guest email send failed:", e);
        }
        if (isPartnerVerified(guide) && guide.partnerEmail?.trim()) {
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
      }

      return jsonSuccess(
        {
          booking,
          message: created
            ? "Booking request sent. The guide will be in touch."
            : "This booking request was already received.",
          replayed: !created,
          storage: hasSupabase() ? "database" : "memory",
          emailStatus: {
            confirmationSent,
            ...(isPartnerVerified(guide) && guide.partnerEmail?.trim()
              ? { guideNotificationSent }
              : {}),
          },
        },
        { headers: rateLimitSuccessHeaders(successLimitRemaining, 10, limitResult.bypassed || emailLimitResult.bypassed) }
      );
    }

    return jsonError("VALIDATION_ERROR", "Invalid booking type", 400);
  } catch (err) {
    if (err instanceof BookingIdempotencyConflictError) {
      return jsonError(
        "IDEMPOTENCY_CONFLICT",
        "This booking key was already used for different details. Start a new booking.",
        409
      );
    }
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
  if (process.env.NODE_ENV === "production" && !hasSupabase() && !isCiE2eTestMode()) {
    // Fail closed in real production; CI E2E production builds fall back to
    // the in-memory store (same double-flag contract as rate limiting).
    return jsonError("SERVICE_UNAVAILABLE", "Booking storage is not configured.", 503);
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const lookupToken = searchParams.get("token")?.trim() || null;
  if (!email) {
    return jsonError("BAD_REQUEST", "email required", 400);
  }
  const parsed = z.string().email().max(254).safeParse(email);
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Invalid email format", 400);
  }

  try {
    const emailNormalized = parsed.data.trim().toLowerCase();
    const authError = await authorizeBookingLookup(req, emailNormalized, lookupToken);
    if (authError) return authError;

    const bookings = await getBookingsByEmail(emailNormalized);
    return jsonSuccess(
      { bookings: bookings.map(publicBookingView) },
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
