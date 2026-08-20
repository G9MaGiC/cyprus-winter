import { describe, it, expect, vi } from "vitest";
import { POST, GET } from "./route";
import { createBookingLookupToken } from "@/lib/booking-lookup-token";
import { sendBookingLookupTokenEmail } from "@/lib/email";

vi.mock("@/lib/email", () => ({
  sendBookingConfirmation: vi.fn().mockResolvedValue(false),
  sendBookingRequestToWinery: vi.fn().mockResolvedValue(false),
  sendBookingRequestToGuide: vi.fn().mockResolvedValue(false),
  sendBookingLookupTokenEmail: vi.fn().mockResolvedValue(true),
}));

function postReq(body: unknown, ip = "127.0.0.2") {
  return new Request("http://localhost:3000/api/bookings", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

function getReq(email?: string, ip = "127.0.0.3", token?: string) {
  const url = new URL("http://localhost:3000/api/bookings");
  if (email != null) url.searchParams.set("email", email);
  if (token != null) url.searchParams.set("token", token);
  return new Request(url.toString(), {
    headers: { "x-forwarded-for": ip },
  });
}

const validBody = {
  type: "winery_tasting",
  providerId: "tsiakkas",
  date: "2099-03-15",
  idempotencyKey: "test-booking-key-001",
  partySize: 2,
  guestEmail: "test@example.com",
  guestName: "Test Guest",
};

describe("POST /api/bookings", () => {
  it("returns 400 for invalid body", async () => {
    const res = await POST(postReq({ providerId: "tsiakkas" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error?.code).toBe("VALIDATION_ERROR");
  });

  it("rejects invalid calendar dates", async () => {
    const res = await POST(postReq({ ...validBody, date: "2099-02-31" }, "127.0.0.31"));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error?.code).toBe("VALIDATION_ERROR");
  });

  it("requires an idempotency key", async () => {
    const withoutKey = { ...validBody, idempotencyKey: undefined };
    const res = await POST(postReq(withoutKey, "127.0.0.32"));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error?.code).toBe("VALIDATION_ERROR");
  });

  it("silently drops honeypot submissions", async () => {
    const res = await POST(
      postReq({ ...validBody, website: "https://bot.example" }, "127.0.0.41")
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.stored).toBe(false);
  });

  it("returns 404 for unknown winery", async () => {
    const res = await POST(
      postReq({ ...validBody, providerId: "unknown-winery-xyz" }, "127.0.0.4")
    );
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error?.code).toBe("NOT_FOUND");
  });

  it("returns 200 for valid request when winery exists", async () => {
    const res = await POST(postReq(validBody, "127.0.0.5"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.booking).toBeDefined();
    expect(data.booking.providerId).toBe("tsiakkas");
  });

  it("rejects reusing an idempotency key with different booking details", async () => {
    const key = "conflict-booking-key-001";
    const first = await POST(postReq({ ...validBody, idempotencyKey: key }, "127.0.0.53"));
    const second = await POST(
      postReq({ ...validBody, idempotencyKey: key, date: "2099-03-16" }, "127.0.0.54")
    );
    expect(first.status).toBe(200);
    expect(second.status).toBe(409);
    const data = await second.json();
    expect(data.error?.code).toBe("IDEMPOTENCY_CONFLICT");
  });

  it("replays an idempotent booking without creating a second record", async () => {
    const body = { ...validBody, idempotencyKey: "replay-booking-key-001" };
    const first = await POST(postReq(body, "127.0.0.51"));
    const second = await POST(postReq(body, "127.0.0.52"));
    const firstData = await first.json();
    const secondData = await second.json();

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(secondData.booking.id).toBe(firstData.booking.id);
    expect(secondData.replayed).toBe(true);
  });
});

describe("GET /api/bookings", () => {
  it("returns 400 when email is missing", async () => {
    const res = await GET(getReq(undefined, "127.0.0.6"));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error?.code).toBe("BAD_REQUEST");
  });

  it("returns 400 for invalid email format", async () => {
    const res = await GET(getReq("not-an-email", "127.0.0.7"));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error?.code).toBe("VALIDATION_ERROR");
  });

  it("returns 200 with bookings array for valid email", async () => {
    const res = await GET(getReq("user@example.com", "127.0.0.8"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(Array.isArray(data.bookings)).toBe(true);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });
});

describe("POST /api/bookings lookup token", () => {
  it("returns a generic message for a lookup-link request", async () => {
    const res = await POST(
      postReq({ action: "request_lookup_token", email: "guest@example.com" }, "127.0.0.90")
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.message).toMatch(/secure lookup link/i);
    expect(data.booking).toBeUndefined();
  });

  it("sends a lookup email when the signing secret is configured", async () => {
    process.env.BOOKING_LOOKUP_TOKEN_SECRET = "booking-lookup-secret-for-tests";
    vi.mocked(sendBookingLookupTokenEmail).mockClear();
    const res = await POST(
      postReq({ action: "request_lookup_token", email: "guest@example.com" }, "127.0.0.95")
    );
    expect(res.status).toBe(200);
    expect(sendBookingLookupTokenEmail).toHaveBeenCalledWith(
      "guest@example.com",
      expect.any(String)
    );
  });
});

describe("GET /api/bookings with lookup token", () => {
  const secret = "booking-lookup-secret-for-tests";

  it("accepts a valid token", async () => {
    process.env.BOOKING_LOOKUP_TOKEN_SECRET = secret;
    const token = createBookingLookupToken("user@example.com");
    const res = await GET(getReq("user@example.com", "127.0.0.91", token));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(Array.isArray(data.bookings)).toBe(true);
    expect(data.bookings.every((b: { guestEmail?: string }) => b.guestEmail === undefined)).toBe(
      true
    );
  });

  it("rejects a tampered token", async () => {
    process.env.BOOKING_LOOKUP_TOKEN_SECRET = secret;
    const token = createBookingLookupToken("user@example.com");
    const res = await GET(getReq("user@example.com", "127.0.0.92", `${token}x`));
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error?.code).toBe("FORBIDDEN");
  });

  it("rejects a token used with a different email", async () => {
    process.env.BOOKING_LOOKUP_TOKEN_SECRET = secret;
    const token = createBookingLookupToken("user@example.com");
    const res = await GET(getReq("other@example.com", "127.0.0.93", token));
    expect(res.status).toBe(403);
    expect((await res.json()).error?.code).toBe("FORBIDDEN");
  });

  it("rejects an expired token", async () => {
    process.env.BOOKING_LOOKUP_TOKEN_SECRET = secret;
    const token = createBookingLookupToken("user@example.com", {
      nowMs: 1_700_000_000_000,
      ttlSeconds: 60,
    });
    const res = await GET(getReq("user@example.com", "127.0.0.94", token));
    expect(res.status).toBe(403);
  });
});
