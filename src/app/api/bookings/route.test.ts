import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "./route";

vi.mock("@/lib/email", () => ({
  sendBookingConfirmation: vi.fn().mockResolvedValue(false),
  sendBookingRequestToWinery: vi.fn().mockResolvedValue(false),
  sendBookingRequestToGuide: vi.fn().mockResolvedValue(false),
}));

// We keep a reference so we can override rateLimit per-test
const rateLimitMock = vi.fn();
vi.mock("@/lib/rate-limit", async (importOriginal) => {
  const orig = await importOriginal<typeof import("@/lib/rate-limit")>();
  return {
    ...orig,
    rateLimit: (...args: unknown[]) => rateLimitMock(...args),
  };
});

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

const validGuideTourBody = {
  type: "guide_tour",
  providerId: "cyprus-active-tours",
  date: "2026-03-20",
  partySize: 3,
  guestEmail: "hiker@example.com",
  guestName: "Hiker Jane",
};

beforeEach(() => {
  vi.clearAllMocks();
  // Default: rate limit passes
  rateLimitMock.mockResolvedValue({ ok: true, remaining: 9, resetAt: Date.now() + 60_000, bypassed: false });
});

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
});

describe("POST /api/bookings — guide_tour", () => {
  it("returns 200 for valid guide_tour booking", async () => {
    const res = await POST(postReq(validGuideTourBody, "127.0.0.20"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.booking).toBeDefined();
    expect(data.booking.providerId).toBe("cyprus-active-tours");
    expect(data.booking.type).toBe("guide_tour");
    expect(data.booking.providerName).toBe("Cyprus Active Tours");
    expect(data.message).toContain("guide");
  });

  it("returns 404 for unknown guide", async () => {
    const res = await POST(
      postReq({ ...validGuideTourBody, providerId: "unknown-guide-xyz" }, "127.0.0.21")
    );
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error?.code).toBe("NOT_FOUND");
  });

  it("appends trail name to notes when trailId is provided", async () => {
    const res = await POST(
      postReq(
        { ...validGuideTourBody, trailId: "artemis", notes: "Morning hike" },
        "127.0.0.22"
      )
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.booking.notes).toContain("Artemis Trail");
    expect(data.booking.notes).toContain("Morning hike");
  });

  it("sets trail name as notes when trailId provided but no notes", async () => {
    const res = await POST(
      postReq({ ...validGuideTourBody, trailId: "artemis" }, "127.0.0.23")
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.booking.notes).toContain("Trail: Artemis Trail");
  });

  it("resolves trail by slug as well as id", async () => {
    const res = await POST(
      postReq({ ...validGuideTourBody, trailId: "artemis-trail" }, "127.0.0.24")
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.booking.notes).toContain("Trail: Artemis Trail");
  });

  it("ignores unknown trailId gracefully (no trail appended)", async () => {
    const res = await POST(
      postReq(
        { ...validGuideTourBody, trailId: "nonexistent-trail", notes: "Just hiking" },
        "127.0.0.25"
      )
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    // Notes should just be the original notes since trail was not found
    expect(data.booking.notes).toBe("Just hiking");
  });
});

describe("POST /api/bookings — rate limiting", () => {
  it("returns 429 when rate limit exceeded", async () => {
    rateLimitMock.mockResolvedValue({ ok: false, remaining: 0, resetAt: Date.now() + 30_000 });
    const res = await POST(postReq(validBody, "127.0.0.30"));
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error?.code).toBe("RATE_LIMITED");
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });

  it("returns 503 when rate limiter throws", async () => {
    rateLimitMock.mockRejectedValue(new Error("Redis connection failed"));
    const res = await POST(postReq(validBody, "127.0.0.31"));
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error?.code).toBe("SERVICE_UNAVAILABLE");
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

  it("returns 429 when GET rate limit exceeded", async () => {
    rateLimitMock.mockResolvedValue({ ok: false, remaining: 0, resetAt: Date.now() + 30_000 });
    const res = await GET(getReq("user@example.com", "127.0.0.32"));
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error?.code).toBe("RATE_LIMITED");
  });

  it("returns 503 when GET rate limiter throws", async () => {
    rateLimitMock.mockRejectedValue(new Error("Redis down"));
    const res = await GET(getReq("user@example.com", "127.0.0.33"));
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error?.code).toBe("SERVICE_UNAVAILABLE");
  });
});
