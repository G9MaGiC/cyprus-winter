import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRateLimit = vi.fn();
const mockGetLiveWeather = vi.fn();
const mockGetWeatherAtCoords = vi.fn();

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
}));

vi.mock("@/lib/weather-live", () => ({
  getLiveWeather: (...args: unknown[]) => mockGetLiveWeather(...args),
  getWeatherAtCoords: (...args: unknown[]) => mockGetWeatherAtCoords(...args),
}));

import { GET } from "./route";

function req(params: Record<string, string> = {}) {
  const url = new URL("http://localhost:3000/api/weather");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString(), {
    headers: { "x-forwarded-for": "127.0.0.1" },
  });
}

const fakeWeather = {
  coast: { minC: 14, maxC: 20 },
  troodos: { minC: 2, maxC: 8 },
};

const fakeCoordsWeather = {
  tempC: 18,
  windKph: 12,
  condition: "partly_cloudy",
};

describe("GET /api/weather", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRateLimit.mockResolvedValue({
      ok: true,
      remaining: 29,
      resetAt: Date.now() + 60_000,
      bypassed: false,
    });
    mockGetLiveWeather.mockResolvedValue(fakeWeather);
    mockGetWeatherAtCoords.mockResolvedValue(fakeCoordsWeather);
  });

  it("returns live weather when no lat/lng provided", async () => {
    const res = await GET(req());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(fakeWeather);
    expect(mockGetLiveWeather).toHaveBeenCalled();
  });

  it("returns weather at coords when lat/lng are provided", async () => {
    const res = await GET(req({ lat: "34.7", lng: "32.4" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(fakeCoordsWeather);
    expect(mockGetWeatherAtCoords).toHaveBeenCalledWith(34.7, 32.4);
  });

  it("falls back to live weather when getWeatherAtCoords returns null", async () => {
    mockGetWeatherAtCoords.mockResolvedValue(null);

    const res = await GET(req({ lat: "34.7", lng: "32.4" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(fakeWeather);
    expect(mockGetLiveWeather).toHaveBeenCalled();
  });

  it("returns 400 for invalid lat", async () => {
    const res = await GET(req({ lat: "abc", lng: "32.4" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for out-of-range lat", async () => {
    const res = await GET(req({ lat: "100", lng: "32.4" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for out-of-range lng", async () => {
    const res = await GET(req({ lat: "34.7", lng: "200" }));
    expect(res.status).toBe(400);
  });

  it("includes Cache-Control headers", async () => {
    const res = await GET(req());
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=3600");
  });

  it("includes rate limit headers", async () => {
    const res = await GET(req());
    expect(res.headers.get("X-RateLimit-Remaining")).toBeDefined();
  });

  it("returns 429 when rate limited", async () => {
    mockRateLimit.mockResolvedValue({
      ok: false,
      remaining: 0,
      resetAt: Date.now() + 60_000,
      bypassed: false,
    });

    const res = await GET(req());
    expect(res.status).toBe(429);
  });

  it("returns 503 when rate limiter throws", async () => {
    mockRateLimit.mockRejectedValue(new Error("redis down"));

    const res = await GET(req());
    expect(res.status).toBe(503);
  });

  it("returns 503 when no weather is available at all", async () => {
    mockGetLiveWeather.mockResolvedValue(null);

    const res = await GET(req());
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error.code).toBe("SERVICE_UNAVAILABLE");
  });

  it("returns 500 when weather API throws", async () => {
    mockGetLiveWeather.mockRejectedValue(new Error("API error"));

    const res = await GET(req());
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error.code).toBe("SERVER_ERROR");
  });
});
