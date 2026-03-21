import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const mockRefreshTrailSummary = vi.fn();
const mockGetSubscribersForTripCountdown = vi.fn();
const mockMarkPushSent = vi.fn();
const mockDeletePushSubscription = vi.fn();
const mockSendPush = vi.fn();
const mockIsPushConfigured = vi.fn();

vi.mock("@/lib/trail-summary-cache", () => ({
  refreshTrailSummary: (...args: unknown[]) => mockRefreshTrailSummary(...args),
}));

vi.mock("@/lib/push-subscriptions", () => ({
  getSubscribersForTripCountdown: (...args: unknown[]) => mockGetSubscribersForTripCountdown(...args),
  markPushSent: (...args: unknown[]) => mockMarkPushSent(...args),
  deletePushSubscription: (...args: unknown[]) => mockDeletePushSubscription(...args),
}));

vi.mock("@/lib/push", () => ({
  sendPush: (...args: unknown[]) => mockSendPush(...args),
  isPushConfigured: () => mockIsPushConfigured(),
}));

import { GET } from "./route";

function req(authHeader?: string) {
  const headers: Record<string, string> = {};
  if (authHeader) headers["authorization"] = authHeader;
  return new Request("http://localhost:3000/api/cron/daily", {
    headers,
  }) as unknown as NextRequest;
}

describe("GET /api/cron/daily", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-secret";
    mockRefreshTrailSummary.mockResolvedValue({ trail1: {}, trail2: {} });
    mockIsPushConfigured.mockReturnValue(false);
  });

  it("returns 401 when no authorization header", async () => {
    const res = await GET(req());
    expect(res.status).toBe(401);
  });

  it("returns 401 when authorization header is wrong", async () => {
    const res = await GET(req("Bearer wrong-secret"));
    expect(res.status).toBe(401);
  });

  it("returns 401 when CRON_SECRET is not set", async () => {
    delete process.env.CRON_SECRET;
    const res = await GET(req("Bearer test-secret"));
    expect(res.status).toBe(401);
  });

  it("returns 200 with trail count when authorized (push not configured)", async () => {
    const res = await GET(req("Bearer test-secret"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.trails).toBe(2);
    expect(data.pushesSent).toBe(0);
    expect(data).toHaveProperty("updated");
  });

  it("sends push notifications to subscribers within countdown range", async () => {
    mockIsPushConfigured.mockReturnValue(true);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    mockGetSubscribersForTripCountdown.mockResolvedValue([
      {
        id: "sub-1",
        trip_start_date: tomorrow.toISOString().split("T")[0],
        subscription: { endpoint: "https://push.example.com/1" },
      },
    ]);
    mockSendPush.mockResolvedValue({ ok: true });
    mockMarkPushSent.mockResolvedValue(undefined);

    const res = await GET(req("Bearer test-secret"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.pushesSent).toBe(1);
    expect(mockSendPush).toHaveBeenCalledOnce();
    expect(mockMarkPushSent).toHaveBeenCalledWith("sub-1");
  });

  it("deletes expired subscriptions", async () => {
    mockIsPushConfigured.mockReturnValue(true);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    mockGetSubscribersForTripCountdown.mockResolvedValue([
      {
        id: "sub-expired",
        trip_start_date: tomorrow.toISOString().split("T")[0],
        subscription: { endpoint: "https://push.example.com/expired" },
      },
    ]);
    mockSendPush.mockResolvedValue({ ok: false, expired: true });

    const res = await GET(req("Bearer test-secret"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.pushesSent).toBe(0);
    expect(mockDeletePushSubscription).toHaveBeenCalledWith("sub-expired");
  });

  it("skips subscribers with no trip_start_date", async () => {
    mockIsPushConfigured.mockReturnValue(true);
    mockGetSubscribersForTripCountdown.mockResolvedValue([
      { id: "sub-no-date", trip_start_date: null, subscription: {} },
    ]);

    const res = await GET(req("Bearer test-secret"));
    const data = await res.json();
    expect(data.pushesSent).toBe(0);
    expect(mockSendPush).not.toHaveBeenCalled();
  });

  it("skips subscribers with trip_start_date more than 3 days away", async () => {
    mockIsPushConfigured.mockReturnValue(true);
    const farFuture = new Date();
    farFuture.setDate(farFuture.getDate() + 10);
    mockGetSubscribersForTripCountdown.mockResolvedValue([
      {
        id: "sub-far",
        trip_start_date: farFuture.toISOString().split("T")[0],
        subscription: { endpoint: "https://push.example.com/far" },
      },
    ]);

    const res = await GET(req("Bearer test-secret"));
    const data = await res.json();
    expect(data.pushesSent).toBe(0);
    expect(mockSendPush).not.toHaveBeenCalled();
  });

  it("returns 500 when refreshTrailSummary throws", async () => {
    mockRefreshTrailSummary.mockRejectedValue(new Error("cache failure"));

    const res = await GET(req("Bearer test-secret"));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error.code).toBe("SERVER_ERROR");
  });
});
