import { describe, it, expect, vi } from "vitest";
import { POST, GET } from "./route";
import { sendBookingConfirmation } from "@/lib/email";

vi.mock("@/lib/email", () => ({
  sendBookingConfirmation: vi.fn().mockResolvedValue(false),
  sendBookingRequestToWinery: vi.fn().mockResolvedValue(false),
  sendBookingRequestToGuide: vi.fn().mockResolvedValue(false),
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

function getReq(email?: string, ip = "127.0.0.3") {
  const url = new URL("http://localhost:3000/api/bookings");
  if (email != null) url.searchParams.set("email", email);
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

describe("POST /api/bookings", () => {
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

  it("deduplicates booking replays with the same idempotency key", async () => {
    vi.mocked(sendBookingConfirmation).mockClear();
    const first = await POST(postReq(validBody, "127.0.0.9"));
    const second = await POST(
      new Request("http://localhost:3000/api/bookings", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "127.0.0.10",
          "Idempotency-Key": "mq-test-booking-replay",
        },
        body: JSON.stringify(validBody),
      })
    );
    const replay = await POST(
      new Request("http://localhost:3000/api/bookings", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "127.0.0.11",
          "Idempotency-Key": "mq-test-booking-replay",
        },
        body: JSON.stringify(validBody),
      })
    );

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(replay.status).toBe(200);
    const secondData = await second.json();
    const replayData = await replay.json();
    expect(replayData.booking.id).toBe(secondData.booking.id);
    expect(sendBookingConfirmation).toHaveBeenCalledTimes(2);
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
    expect(Array.isArray(data.bookings)).toBe(true);
  });
});
