import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { getBookingsCountInRange } from "@/lib/bookings";
import { getPartnerRevenueInRange } from "@/lib/partner-revenue";
import {
  getEventSourceBreakdownInRange,
  getFunnelCountsInRange,
  getFunnelLocaleBreakdownInRange,
} from "@/lib/funnel";
import { getStatsRangeStartUtc } from "@/lib/stats-window";
import { ADMIN_SESSION_COOKIE, createAdminSessionToken } from "@/lib/admin-session";

vi.mock("@/lib/bookings", () => ({
  getBookingsCountInRange: vi.fn(),
}));

vi.mock("@/lib/partner-revenue", () => ({
  getPartnerRevenueInRange: vi.fn(),
}));

vi.mock("@/lib/funnel", () => ({
  getFunnelCountsInRange: vi.fn(),
  getEventSourceBreakdownInRange: vi.fn(),
  getFunnelLocaleBreakdownInRange: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  hasSupabase: vi.fn().mockReturnValue(false),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue({
    ok: true,
    remaining: 29,
    resetAt: Date.now() + 60_000,
    bypassed: false,
  }),
}));

function statsReq(
  path = "/api/stats",
  opts?: { authorization?: string; cookie?: string }
) {
  const headers: Record<string, string> = { "x-forwarded-for": "127.0.0.1" };
  if (opts?.authorization !== undefined) {
    headers.Authorization = opts.authorization;
  }
  if (opts?.cookie !== undefined) {
    headers.cookie = opts.cookie;
  }
  return new NextRequest(new URL(`http://localhost:3000${path}`), { headers });
}

describe("GET /api/stats", () => {
  let prevAdminSecret: string | undefined;

  beforeEach(() => {
    prevAdminSecret = process.env.ADMIN_SECRET;
    process.env.ADMIN_SECRET = "test-admin-secret";
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-15T14:30:00.000Z"));
    vi.mocked(getBookingsCountInRange).mockResolvedValue(0);
    vi.mocked(getPartnerRevenueInRange).mockResolvedValue({
      totalRevenueEur: 0,
      byPartner: [],
    });
    vi.mocked(getFunnelCountsInRange).mockResolvedValue({});
    vi.mocked(getEventSourceBreakdownInRange).mockResolvedValue({
      shop_click: [],
      plan_add: [],
    });
    vi.mocked(getFunnelLocaleBreakdownInRange).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env.ADMIN_SECRET = prevAdminSecret;
    vi.clearAllMocks();
  });

  it("returns 401 when Authorization does not match ADMIN_SECRET", async () => {
    const res = await GET(statsReq("/api/stats", { authorization: "Bearer wrong" }));
    expect(res.status).toBe(401);
  });

  it("returns 200 with valid HttpOnly admin session cookie", async () => {
    const cookieVal = createAdminSessionToken("test-admin-secret");
    const res = await GET(
      statsReq("/api/stats", { cookie: `${ADMIN_SESSION_COOKIE}=${cookieVal}` })
    );
    expect(res.status).toBe(200);
  });

  it("returns JSON with window=7d and UTC rangeStartIso aligned to stats-window helper", async () => {
    const res = await GET(
      statsReq("/api/stats?window=7d", { authorization: "Bearer test-admin-secret" })
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      window: string;
      rangeStartIso: string;
      rangeEndIso: string;
      compare: { rangeStartIso: string };
    };
    expect(data.window).toBe("7d");
    const expectedStart = getStatsRangeStartUtc("7d", new Date("2026-05-15T14:30:00.000Z")).toISOString();
    expect(data.rangeStartIso).toBe(expectedStart);
    expect(data.rangeEndIso).toBe("2026-05-15T14:30:00.000Z");
    expect(typeof data.compare.rangeStartIso).toBe("string");
  });

  it("defaults invalid window query to mtd", async () => {
    const res = await GET(
      statsReq("/api/stats?window=nope", { authorization: "Bearer test-admin-secret" })
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as { window: string };
    expect(data.window).toBe("mtd");
  });

  it("calls data loaders with current and previous ranges", async () => {
    await GET(
      statsReq("/api/stats?window=30d", { authorization: "Bearer test-admin-secret" })
    );
    expect(getBookingsCountInRange).toHaveBeenCalled();
    expect(vi.mocked(getBookingsCountInRange).mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(vi.mocked(getPartnerRevenueInRange).mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(vi.mocked(getFunnelCountsInRange).mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(vi.mocked(getEventSourceBreakdownInRange).mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("includes rate-limit success headers", async () => {
    const res = await GET(statsReq("/api/stats", { authorization: "Bearer test-admin-secret" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("X-RateLimit-Remaining")).toBeDefined();
  });

  it("returns 401 for CSV export without an admin session", async () => {
    const res = await GET(statsReq("/api/stats?format=csv"));
    expect(res.status).toBe(401);
  });

  it("returns a CSV attachment when format=csv and the session is valid", async () => {
    vi.mocked(getFunnelCountsInRange).mockResolvedValue({ plan_add: 12, booking_start: 4 });
    vi.mocked(getPartnerRevenueInRange).mockResolvedValue({
      totalRevenueEur: 90.5,
      byPartner: [
        {
          providerId: "tsiakkas",
          providerName: "Tsiakkas Winery",
          bookingCount: 2,
          totalFeeEur: 70,
        },
      ],
    });
    const cookieVal = createAdminSessionToken("test-admin-secret");
    const res = await GET(
      statsReq("/api/stats?format=csv", { cookie: `${ADMIN_SESSION_COOKIE}=${cookieVal}` })
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/text\/csv/);
    expect(res.headers.get("content-disposition")).toMatch(/attachment;.*cyprus-winter-kpis-mtd-2026-05-15\.csv/);
    const body = await res.text();
    expect(body).toContain("funnel,plan_add,12");
    expect(body).toContain("partner,tsiakkas");
  });
});
