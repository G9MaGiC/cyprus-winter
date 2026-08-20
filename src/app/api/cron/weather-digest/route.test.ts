import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";

vi.mock("@/lib/weather-live", () => ({
  getLiveWeather: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/push-subscriptions", () => ({
  getSubscribersForWeatherDigest: vi.fn().mockResolvedValue([]),
  markWeatherPushSent: vi.fn(),
  deletePushSubscription: vi.fn(),
}));

vi.mock("@/lib/push", () => ({
  isPushConfigured: vi.fn().mockReturnValue(false),
  sendPush: vi.fn(),
}));

describe("cron weather-digest API", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", "cron-test-secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns JSON 401 without bearer token", async () => {
    const req = new NextRequest("http://localhost:3000/api/cron/weather-digest");
    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error?.code).toBe("UNAUTHORIZED");
  });
});
