import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const DEFAULT_TTL_SECONDS = 15 * 60;

type TokenPayload = {
  email: string;
  nonce: string;
  exp: number;
};

export type BookingLookupTokenResult =
  | { ok: true; email: string }
  | { ok: false; reason: "INVALID" | "EXPIRED" | "MISMATCH" };

function getTokenSecret(): string {
  const secret = process.env.BOOKING_LOOKUP_TOKEN_SECRET;
  if (!secret || secret.trim().length < 16) {
    throw new Error("BOOKING_LOOKUP_TOKEN_SECRET missing or too short");
  }
  return secret;
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function signPayload(payloadEncoded: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadEncoded).digest("base64url");
}

export function createBookingLookupToken(
  email: string,
  options?: { ttlSeconds?: number; nowMs?: number; nonce?: string }
): string {
  const nowMs = options?.nowMs ?? Date.now();
  const ttlSeconds = options?.ttlSeconds ?? DEFAULT_TTL_SECONDS;
  const nonce = options?.nonce ?? randomBytes(16).toString("hex");
  const payload: TokenPayload = {
    email: normalizeEmail(email),
    nonce,
    exp: Math.floor(nowMs / 1000) + ttlSeconds,
  };

  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(payloadEncoded, getTokenSecret());
  return `${payloadEncoded}.${signature}`;
}

export function verifyBookingLookupToken(
  token: string,
  email: string,
  options?: { nowMs?: number }
): BookingLookupTokenResult {
  const secret = getTokenSecret();
  const [payloadEncoded, signature] = token.split(".");
  if (!payloadEncoded || !signature) {
    return { ok: false, reason: "INVALID" };
  }

  const expectedSig = signPayload(payloadEncoded, secret);
  const signatureBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSig, "utf8");
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return { ok: false, reason: "INVALID" };
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadEncoded)) as TokenPayload;
    if (!payload?.email || typeof payload.exp !== "number") {
      return { ok: false, reason: "INVALID" };
    }
    if (payload.exp <= Math.floor((options?.nowMs ?? Date.now()) / 1000)) {
      return { ok: false, reason: "EXPIRED" };
    }

    const normalizedEmail = normalizeEmail(email);
    if (payload.email !== normalizedEmail) {
      return { ok: false, reason: "MISMATCH" };
    }

    return { ok: true, email: payload.email };
  } catch {
    return { ok: false, reason: "INVALID" };
  }
}
