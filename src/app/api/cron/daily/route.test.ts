import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";

vi.mock("@/lib/trail-summary-cache", () => ({
  refreshTrailSummary: vi.fn().mockResolvedValue({ "artemis-trail": { status: "open" } }),
}));

vi.mock("@/lib/push-subscriptions", () => ({
  getSubscribersForTripCountdown: vi.fn().mockResolvedValue([]),
  markPushSent: vi.fn(),
  deletePushSubscription: vi.fn(),
}));

vi.mock("@/lib/push", () => ({
  isPushConfigured: vi.fn().mockReturnValue(false),
  sendPush: vi.fn(),
}));

describe("cron daily API", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", "cron-test-secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 401 without bearer token", async () => {
    const req = new NextRequest("http://localhost:3000/api/cron/daily");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 with wrong bearer token", async () => {
    const req = new NextRequest("http://localhost:3000/api/cron/daily", {
      headers: { authorization: "Bearer wrong" },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns ok payload with valid bearer", async () => {
    const req = new NextRequest("http://localhost:3000/api/cron/daily", {
      headers: { authorization: "Bearer cron-test-secret" },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.trails).toBe(1);
  });
});
