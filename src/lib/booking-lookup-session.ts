import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const SESSION_TTL_SECONDS = 15 * 60;
const MIN_SECRET_LENGTH = 16;

type SessionPayload = { email: string; nonce: string; exp: number };

function secret(): string {
  const value = process.env.BOOKING_LOOKUP_TOKEN_SECRET;
  if (!value || value.trim().length < MIN_SECRET_LENGTH) {
    throw new Error("BOOKING_LOOKUP_TOKEN_SECRET missing or too short");
  }
  return value;
}

function encode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createBookingLookupSession(email: string, nowMs = Date.now()): string {
  const payload: SessionPayload = {
    email: email.trim().toLowerCase(),
    nonce: randomBytes(16).toString("hex"),
    exp: Math.floor(nowMs / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = encode(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

export function verifyBookingLookupSession(token: string, email: string, nowMs = Date.now()): boolean {
  const [payloadEncoded, signature] = token.split(".");
  if (!payloadEncoded || !signature) return false;
  const expected = sign(payloadEncoded);
  const a = Buffer.from(signature, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const payload = JSON.parse(decode(payloadEncoded)) as SessionPayload;
    return Boolean(
      payload.email && payload.email === email.trim().toLowerCase() &&
      payload.nonce && payload.exp > Math.floor(nowMs / 1000)
    );
  } catch {
    return false;
  }
}

export const BOOKING_LOOKUP_SESSION_COOKIE = "cw_booking_lookup";
export const BOOKING_LOOKUP_SESSION_MAX_AGE = SESSION_TTL_SECONDS;
