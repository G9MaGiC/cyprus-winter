import { describe, it, expect, vi } from "vitest";
import { POST, GET } from "./route";

vi.mock("@/lib/email", () => ({
  sendBookingConfirmation: vi.fn().mockResolvedValue(false),
  sendBookingRequestToWinery: vi.fn().mockResolvedValue(false),
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
    expect(Array.isArray(data.bookings)).toBe(true);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });
});
