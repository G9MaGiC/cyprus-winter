import { z } from "zod";
import {
  BOOKING_LOOKUP_SESSION_COOKIE,
  BOOKING_LOOKUP_SESSION_MAX_AGE,
  createBookingLookupSession,
} from "@/lib/booking-lookup-session";
import { isBookingLookupTokenConfigured, verifyBookingLookupToken } from "@/lib/booking-lookup-token";
import { jsonError, jsonSuccess, readJsonBody, RequestBodyTooLargeError } from "@/lib/api-response";

const schema = z.object({
  email: z.string().email().max(254),
  token: z.string().min(1).max(4096),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await readJsonBody(req, 8_000);
  } catch (err) {
    if (err instanceof RequestBodyTooLargeError) {
      return jsonError("PAYLOAD_TOO_LARGE", "Lookup payload is too large.", 413);
    }
    return jsonError("VALIDATION_ERROR", "Invalid JSON body", 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Invalid lookup request", 400);
  }
  if (!isBookingLookupTokenConfigured()) {
    return jsonError("SERVICE_UNAVAILABLE", "Booking lookup is not configured.", 503);
  }

  const email = parsed.data.email.trim().toLowerCase();
  const verification = verifyBookingLookupToken(parsed.data.token, email);
  if (!verification.ok) {
    return jsonError("FORBIDDEN", "Invalid or expired lookup token", 403);
  }

  const response = jsonSuccess({ message: "Booking lookup authorized." });
  response.headers.append(
    "Set-Cookie",
    `${BOOKING_LOOKUP_SESSION_COOKIE}=${createBookingLookupSession(email)}; Max-Age=${BOOKING_LOOKUP_SESSION_MAX_AGE}; Path=/; HttpOnly; Secure; SameSite=Lax`
  );
  return response;
}
