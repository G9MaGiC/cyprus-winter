import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const mockRateLimit = vi.fn();
const mockGetBookingsCountThisMonth = vi.fn();
const mockGetPartnerRevenueThisMonth = vi.fn();
const mockGetFunnelCountsThisMonth = vi.fn();
const mockHasSupabase = vi.fn();

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
}));

vi.mock("@/lib/bookings", () => ({
  getBookingsCountThisMonth: (...args: unknown[]) => mockGetBookingsCountThisMonth(...args),
}));

vi.mock("@/lib/partner-revenue", () => ({
  getPartnerRevenueThisMonth: (...args: unknown[]) => mockGetPartnerRevenueThisMonth(...args),
}));

vi.mock("@/lib/funnel", () => ({
  getFunnelCountsThisMonth: (...args: unknown[]) => mockGetFunnelCountsThisMonth(...args),
}));

vi.mock("@/lib/supabase", () => ({
  hasSupabase: () => mockHasSupabase(),
}));

import { GET } from "./route";

function req(headers: Record<string, string> = {}) {
  return new Request("http://localhost:3000/api/stats", {
    headers: { "x-forwarded-for": "127.0.0.1", ...headers },
  }) as unknown as NextRequest;
}

describe("GET /api/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_SECRET = "admin-secret-123";
    mockRateLimit.mockResolvedValue({
      ok: true,
      remaining: 29,
      resetAt: Date.now() + 60_000,
      bypassed: false,
    });
    mockGetBookingsCountThisMonth.mockResolvedValue(42);
    mockGetPartnerRevenueThisMonth.mockResolvedValue({
      totalRevenueEur: 1500,
      byPartner: { "winery-a": 800, "winery-b": 700 },
    });
    mockGetFunnelCountsThisMonth.mockResolvedValue({
      page_view: 1000,
      discover_view: 500,
      shop_click: 100,
      booking_complete: 10,
    });
    mockHasSupabase.mockReturnValue(true);
  });

  it("returns 401 when no authorization is provided", async () => {
    const res = await GET(req());
    expect(res.status).toBe(401);
  });

  it("returns 401 when authorization token is wrong", async () => {
    const res = await GET(req({ authorization: "Bearer wrong-token" }));
    expect(res.status).toBe(401);
  });

  it("returns 401 when ADMIN_SECRET is not set", async () => {
    delete process.env.ADMIN_SECRET;
    const res = await GET(req({ authorization: "Bearer admin-secret-123" }));
    expect(res.status).toBe(401);
  });

  it("returns 401 when ADMIN_SECRET is empty string", async () => {
    process.env.ADMIN_SECRET = "";
    const res = await GET(req({ authorization: "Bearer " }));
    expect(res.status).toBe(401);
  });

  it("accepts x-admin-token header", async () => {
    const res = await GET(req({ "x-admin-token": "admin-secret-123" }));
    expect(res.status).toBe(200);
  });

  it("returns 200 with stats when authorized via Bearer", async () => {
    const res = await GET(req({ authorization: "Bearer admin-secret-123" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.bookingsThisMonth).toBe(42);
    expect(data.partnerRevenueEur).toBe(1500);
    expect(data.partnerRevenueByWinery).toEqual({ "winery-a": 800, "winery-b": 700 });
    expect(data.storage).toBe("supabase");
    expect(data.funnel).toBeInstanceOf(Array);
    expect(data.funnel.length).toBe(7);
  });

  it("returns storage=memory when supabase is not available", async () => {
    mockHasSupabase.mockReturnValue(false);
    const res = await GET(req({ authorization: "Bearer admin-secret-123" }));
    const data = await res.json();
    expect(data.storage).toBe("memory");
  });

  it("includes funnel in correct order with 0 for missing events", async () => {
    const res = await GET(req({ authorization: "Bearer admin-secret-123" }));
    const data = await res.json();
    const funnelEvents = data.funnel.map((f: { event: string }) => f.event);
    expect(funnelEvents).toEqual([
      "page_view",
      "discover_view",
      "winery_detail_view",
      "shop_click",
      "plan_add",
      "booking_start",
      "booking_complete",
    ]);
    // winery_detail_view was not in mock data, should be 0
    const wineryStep = data.funnel.find((f: { event: string }) => f.event === "winery_detail_view");
    expect(wineryStep.count).toBe(0);
  });

  it("includes rate limit headers", async () => {
    const res = await GET(req({ authorization: "Bearer admin-secret-123" }));
    expect(res.headers.get("X-RateLimit-Remaining")).toBeDefined();
  });

  it("returns 429 when rate limited", async () => {
    mockRateLimit.mockResolvedValue({
      ok: false,
      remaining: 0,
      resetAt: Date.now() + 60_000,
      bypassed: false,
    });

    const res = await GET(req({ authorization: "Bearer admin-secret-123" }));
    expect(res.status).toBe(429);
  });

  it("returns 503 when rate limiter throws", async () => {
    mockRateLimit.mockRejectedValue(new Error("redis down"));

    const res = await GET(req({ authorization: "Bearer admin-secret-123" }));
    expect(res.status).toBe(503);
  });

  it("returns 500 when stats fetching throws", async () => {
    mockGetBookingsCountThisMonth.mockRejectedValue(new Error("db error"));

    const res = await GET(req({ authorization: "Bearer admin-secret-123" }));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error.code).toBe("SERVER_ERROR");
  });
});
