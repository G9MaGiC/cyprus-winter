import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const mockRateLimit = vi.fn();
const mockIsPushConfigured = vi.fn();
const mockGetSupabase = vi.fn();

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
}));

vi.mock("@/lib/push", () => ({
  isPushConfigured: () => mockIsPushConfigured(),
}));

vi.mock("@/lib/supabase", () => ({
  getSupabase: () => mockGetSupabase(),
}));

import { POST } from "./route";

const validBody = {
  clientId: "client-id-12345678",
  subscription: {
    endpoint: "https://fcm.googleapis.com/fcm/send/abc123",
    keys: {
      p256dh: "BNcRdreALRFX7sBGGHJXD4-JBfYTrQMrK0bM2FnwGhA",
      auth: "tBH-IFQi-oYs5EL1DB_PjQ",
    },
  },
  tripStartDate: "2026-01-15",
  pushTripCountdown: true,
  pushWeatherDigest: false,
};

function req(body: unknown) {
  return new Request("http://localhost:3000/api/push/subscribe", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "127.0.0.1",
    },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe("POST /api/push/subscribe", () => {
  let mockFrom: ReturnType<typeof vi.fn>;
  let mockSelect: ReturnType<typeof vi.fn>;
  let mockEq: ReturnType<typeof vi.fn>;
  let mockSingle: ReturnType<typeof vi.fn>;
  let mockUpsert: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPushConfigured.mockReturnValue(true);
    mockRateLimit.mockResolvedValue({
      ok: true,
      remaining: 4,
      resetAt: Date.now() + 60_000,
      bypassed: false,
    });

    // Build the Supabase mock chain
    mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    mockUpsert = vi.fn().mockResolvedValue({ error: null });
    mockFrom = vi.fn().mockReturnValue({
      select: mockSelect,
      upsert: mockUpsert,
    });
    mockGetSupabase.mockReturnValue({ from: mockFrom });
  });

  it("returns 503 when push is not configured", async () => {
    mockIsPushConfigured.mockReturnValue(false);
    const res = await POST(req(validBody));
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error.message).toContain("not configured");
  });

  it("returns 503 when rate limiter throws", async () => {
    mockRateLimit.mockRejectedValue(new Error("redis down"));
    const res = await POST(req(validBody));
    expect(res.status).toBe(503);
  });

  it("returns 429 when rate limited", async () => {
    mockRateLimit.mockResolvedValue({
      ok: false,
      remaining: 0,
      resetAt: Date.now() + 60_000,
      bypassed: false,
    });
    const res = await POST(req(validBody));
    expect(res.status).toBe(429);
  });

  it("returns 503 when supabase is not available", async () => {
    mockGetSupabase.mockReturnValue(null);
    const res = await POST(req(validBody));
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error.message).toContain("Storage");
  });

  it("returns 400 for missing clientId", async () => {
    const { clientId: _, ...body } = validBody;
    const res = await POST(req(body));
    expect(res.status).toBe(400);
  });

  it("returns 400 for clientId too short", async () => {
    const res = await POST(req({ ...validBody, clientId: "abc" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid subscription endpoint", async () => {
    const res = await POST(
      req({
        ...validBody,
        subscription: { ...validBody.subscription, endpoint: "not-a-url" },
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing subscription keys", async () => {
    const res = await POST(
      req({
        ...validBody,
        subscription: { endpoint: "https://example.com" },
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid tripStartDate format", async () => {
    const res = await POST(req({ ...validBody, tripStartDate: "Jan 15 2026" }));
    expect(res.status).toBe(400);
  });

  it("returns 200 on successful subscription", async () => {
    const res = await POST(req(validBody));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("upserts with correct id format", async () => {
    await POST(req(validBody));
    expect(mockFrom).toHaveBeenCalledWith("push_subscriptions");
    expect(mockUpsert).toHaveBeenCalled();
    const upsertArg = mockUpsert.mock.calls[0][0];
    expect(upsertArg.id).toBe("ps-client-id-12345678");
    expect(upsertArg.client_id).toBe("client-id-12345678");
  });

  it("merges preferences with existing subscription", async () => {
    mockSingle.mockResolvedValue({
      data: {
        push_trip_countdown: true,
        push_weather_digest: true,
        trip_start_date: "2026-01-10",
      },
      error: null,
    });

    const body = {
      ...validBody,
      pushTripCountdown: false,
      pushWeatherDigest: false,
      tripStartDate: null,
    };
    await POST(req(body));

    const upsertArg = mockUpsert.mock.calls[0][0];
    // Should not turn off existing opt-in
    expect(upsertArg.push_trip_countdown).toBe(true);
    expect(upsertArg.push_weather_digest).toBe(true);
    // Should preserve existing trip_start_date when null sent
    expect(upsertArg.trip_start_date).toBe("2026-01-10");
  });

  it("returns 500 when upsert fails", async () => {
    mockUpsert.mockResolvedValue({ error: { message: "db error" } });

    const res = await POST(req(validBody));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error.code).toBe("SERVER_ERROR");
  });

  it("includes rate limit headers on success", async () => {
    const res = await POST(req(validBody));
    expect(res.headers.get("X-RateLimit-Remaining")).toBeDefined();
  });

  it("accepts optional fields as absent", async () => {
    const body = {
      clientId: "client-id-12345678",
      subscription: validBody.subscription,
    };
    const res = await POST(req(body));
    expect(res.status).toBe(200);
  });
});
