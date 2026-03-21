import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const mockGetLiveWeather = vi.fn();
const mockGetSubscribersForWeatherDigest = vi.fn();
const mockMarkWeatherPushSent = vi.fn();
const mockDeletePushSubscription = vi.fn();
const mockSendPush = vi.fn();
const mockIsPushConfigured = vi.fn();

vi.mock("@/lib/weather-live", () => ({
  getLiveWeather: (...args: unknown[]) => mockGetLiveWeather(...args),
}));

vi.mock("@/lib/push-subscriptions", () => ({
  getSubscribersForWeatherDigest: (...args: unknown[]) => mockGetSubscribersForWeatherDigest(...args),
  markWeatherPushSent: (...args: unknown[]) => mockMarkWeatherPushSent(...args),
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
  return new Request("http://localhost:3000/api/cron/weather-digest", {
    headers,
  }) as unknown as NextRequest;
}

const fakeWeather = {
  coast: { minC: 14, maxC: 20 },
  troodos: { minC: 2, maxC: 8 },
};

describe("GET /api/cron/weather-digest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-secret";
    mockIsPushConfigured.mockReturnValue(false);
    mockGetLiveWeather.mockResolvedValue(fakeWeather);
  });

  it("returns 401 when no authorization header", async () => {
    const res = await GET(req());
    expect(res.status).toBe(401);
  });

  it("returns 401 when authorization header is wrong", async () => {
    const res = await GET(req("Bearer wrong"));
    expect(res.status).toBe(401);
  });

  it("returns 401 when CRON_SECRET is not set", async () => {
    delete process.env.CRON_SECRET;
    const res = await GET(req("Bearer test-secret"));
    expect(res.status).toBe(401);
  });

  it("returns 200 with weather=live when weather data is available", async () => {
    const res = await GET(req("Bearer test-secret"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.weather).toBe("live");
    expect(data.pushesSent).toBe(0);
    expect(data).toHaveProperty("updated");
  });

  it("returns weather=fallback when getLiveWeather returns null", async () => {
    mockGetLiveWeather.mockResolvedValue(null);

    const res = await GET(req("Bearer test-secret"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.weather).toBe("fallback");
  });

  it("sends push notifications to weather digest subscribers", async () => {
    mockIsPushConfigured.mockReturnValue(true);
    mockGetSubscribersForWeatherDigest.mockResolvedValue([
      { id: "ws-1", subscription: { endpoint: "https://push.example.com/1" } },
      { id: "ws-2", subscription: { endpoint: "https://push.example.com/2" } },
    ]);
    mockSendPush.mockResolvedValue({ ok: true });

    const res = await GET(req("Bearer test-secret"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.pushesSent).toBe(2);
    expect(mockSendPush).toHaveBeenCalledTimes(2);
    expect(mockMarkWeatherPushSent).toHaveBeenCalledTimes(2);
  });

  it("deletes expired subscriptions on push failure", async () => {
    mockIsPushConfigured.mockReturnValue(true);
    mockGetSubscribersForWeatherDigest.mockResolvedValue([
      { id: "ws-expired", subscription: { endpoint: "https://push.example.com/expired" } },
    ]);
    mockSendPush.mockResolvedValue({ ok: false, expired: true });

    const res = await GET(req("Bearer test-secret"));
    const data = await res.json();
    expect(data.pushesSent).toBe(0);
    expect(mockDeletePushSubscription).toHaveBeenCalledWith("ws-expired");
  });

  it("does not delete non-expired failed pushes", async () => {
    mockIsPushConfigured.mockReturnValue(true);
    mockGetSubscribersForWeatherDigest.mockResolvedValue([
      { id: "ws-fail", subscription: { endpoint: "https://push.example.com/fail" } },
    ]);
    mockSendPush.mockResolvedValue({ ok: false, expired: false });

    const res = await GET(req("Bearer test-secret"));
    const data = await res.json();
    expect(data.pushesSent).toBe(0);
    expect(mockDeletePushSubscription).not.toHaveBeenCalled();
    expect(mockMarkWeatherPushSent).not.toHaveBeenCalled();
  });

  it("returns 500 when getLiveWeather throws", async () => {
    mockGetLiveWeather.mockRejectedValue(new Error("API down"));

    const res = await GET(req("Bearer test-secret"));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error.code).toBe("SERVER_ERROR");
  });
});
