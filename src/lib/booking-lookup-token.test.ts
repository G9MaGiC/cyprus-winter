import { describe, it, expect, beforeEach } from "vitest";
import { createBookingLookupToken, verifyBookingLookupToken } from "./booking-lookup-token";

describe("booking lookup token", () => {
  beforeEach(() => {
    process.env.BOOKING_LOOKUP_TOKEN_SECRET = "booking-lookup-secret-for-tests";
  });

  it("accepts a valid token", () => {
    const token = createBookingLookupToken("guest@example.com", { nowMs: 1_700_000_000_000 });
    const result = verifyBookingLookupToken(token, "guest@example.com", {
      nowMs: 1_700_000_100_000,
    });

    expect(result).toEqual({ ok: true, email: "guest@example.com" });
  });

  it("rejects an expired token", () => {
    const token = createBookingLookupToken("guest@example.com", {
      nowMs: 1_700_000_000_000,
      ttlSeconds: 600,
    });

    const result = verifyBookingLookupToken(token, "guest@example.com", {
      nowMs: 1_700_000_700_000,
    });

    expect(result).toEqual({ ok: false, reason: "EXPIRED" });
  });

  it("rejects a tampered token", () => {
    const token = createBookingLookupToken("guest@example.com");
    const tampered = `${token}x`;

    const result = verifyBookingLookupToken(tampered, "guest@example.com");

    expect(result).toEqual({ ok: false, reason: "INVALID" });
  });

  it("rejects a token used with a different email", () => {
    const token = createBookingLookupToken("guest@example.com");

    const result = verifyBookingLookupToken(token, "other@example.com");

    expect(result).toEqual({ ok: false, reason: "MISMATCH" });
  });

  it("rejects a token with extra dot-separated segments", () => {
    const token = createBookingLookupToken("guest@example.com");
    const withExtra = `${token}.extrasegment`;

    const result = verifyBookingLookupToken(withExtra, "guest@example.com");

    expect(result).toEqual({ ok: false, reason: "INVALID" });
  });
});
