import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "./route";
import { createBookingLookupToken } from "@/lib/booking-lookup-token";

const { sendBookingLookupTokenEmail } = vi.hoisted(() => ({
  sendBookingLookupTokenEmail: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/email", () => ({
  sendBookingConfirmation: vi.fn().mockResolvedValue(false),
  sendBookingRequestToWinery: vi.fn().mockResolvedValue(false),
  sendBookingRequestToGuide: vi.fn().mockResolvedValue(false),
  sendBookingLookupTokenEmail,
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

function getReq(email?: string, token?: string, ip = "127.0.0.3") {
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
  date: "2026-03-15",
  partySize: 2,
  guestEmail: "test@example.com",
  guestName: "Test Guest",
};

beforeEach(() => {
  process.env.BOOKING_LOOKUP_TOKEN_SECRET = "booking-lookup-secret-for-tests";
  sendBookingLookupTokenEmail.mockClear();
});

describe("POST /api/bookings", () => {
  it("returns generic success and sends lookup token email for lookup token requests", async () => {
    const res = await POST(
      postReq({ action: "request_lookup_token", email: "user@example.com" }, "127.0.0.20")
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toContain("If an account exists");
    expect(sendBookingLookupTokenEmail).toHaveBeenCalledTimes(1);
    expect(sendBookingLookupTokenEmail.mock.calls[0]?.[0]).toBe("user@example.com");
    expect(typeof sendBookingLookupTokenEmail.mock.calls[0]?.[1]).toBe("string");
  });

  it("returns 400 for invalid body", async () => {
    const res = await POST(postReq({ providerId: "tsiakkas" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error?.code).toBe("VALIDATION_ERROR");
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
    expect(data.booking).toBeDefined();
    expect(data.booking.providerId).toBe("tsiakkas");
  });
});

describe("GET /api/bookings", () => {
  it("returns 400 when token is missing", async () => {
    const res = await GET(getReq("user@example.com", undefined, "127.0.0.6"));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error?.code).toBe("BAD_REQUEST");
  });

  it("returns 400 for invalid email format", async () => {
    const token = createBookingLookupToken("user@example.com");
    const res = await GET(getReq("not-an-email", token, "127.0.0.7"));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error?.code).toBe("VALIDATION_ERROR");
  });

  it("returns 403 for mismatched email and token", async () => {
    const token = createBookingLookupToken("other@example.com");
    const res = await GET(getReq("user@example.com", token, "127.0.0.9"));
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error?.code).toBe("FORBIDDEN");
  });

  it("returns 200 with bookings array for valid email and token", async () => {
    const token = createBookingLookupToken("user@example.com");
    const res = await GET(getReq("user@example.com", token, "127.0.0.8"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.bookings)).toBe(true);
  });
});
