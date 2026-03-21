import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRateLimit = vi.fn();
const mockScoreAndRank = vi.fn();
const mockAssignDiscoveryBadges = vi.fn();
const mockGetWeatherAtCoords = vi.fn();

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
}));

vi.mock("@/lib/right-now-scoring", () => ({
  scoreAndRank: (...args: unknown[]) => mockScoreAndRank(...args),
  assignDiscoveryBadges: (...args: unknown[]) => mockAssignDiscoveryBadges(...args),
}));

vi.mock("@/lib/weather-live", () => ({
  getWeatherAtCoords: (...args: unknown[]) => mockGetWeatherAtCoords(...args),
}));

vi.mock("@/lib/cyprus-images", () => ({
  getAttractionImage: vi.fn().mockReturnValue("/img/default.jpg"),
  getTrailImage: vi.fn().mockReturnValue("/img/trail.jpg"),
}));

vi.mock("@/data", () => ({
  getAttractionById: vi.fn().mockReturnValue(null),
  getRestaurantById: vi.fn().mockReturnValue(null),
}));

vi.mock("@/data/trails", () => ({
  trails: [],
}));

vi.mock("@/data/events", () => ({
  winterEvents: [],
}));

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { GET } from "./route";

function req(params: Record<string, string> = {}) {
  const url = new URL("http://localhost:3000/api/right-now");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString(), {
    headers: { "x-forwarded-for": "127.0.0.1" },
  });
}

const fakeWeather = { tempC: 18, windKph: 10, condition: "clear" };

const fakeScoredItems = [
  {
    id: "place-1",
    name: "Avakas Gorge",
    region: "paphos",
    type: "trail",
    score: 90,
    distanceKm: 5,
    timeOfDayMatch: true,
    discoveryBadge: "Golden hour",
    localSecret: undefined,
    winterTip: undefined,
  },
];

describe("GET /api/right-now", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRateLimit.mockResolvedValue({
      ok: true,
      remaining: 29,
      resetAt: Date.now() + 60_000,
      bypassed: false,
    });
    mockGetWeatherAtCoords.mockResolvedValue(fakeWeather);
    mockScoreAndRank.mockReturnValue(fakeScoredItems);
    mockAssignDiscoveryBadges.mockImplementation((items: unknown[]) => items);
  });

  it("returns 400 when lat/lng are missing", async () => {
    const res = await GET(req());
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when lat is out of range", async () => {
    const res = await GET(req({ lat: "100", lng: "33" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when lng is out of range", async () => {
    const res = await GET(req({ lat: "35", lng: "200" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when lat is not a number", async () => {
    const res = await GET(req({ lat: "abc", lng: "33" }));
    expect(res.status).toBe(400);
  });

  it("returns 200 with items for valid lat/lng", async () => {
    const res = await GET(req({ lat: "34.7", lng: "32.4" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toBeInstanceOf(Array);
    expect(data.items.length).toBe(1);
    expect(data.items[0].id).toBe("place-1");
    expect(data.items[0].href).toBe("/trails/place-1");
    expect(data.meta.locationUsed).toBe(true);
    expect(data.meta).toHaveProperty("timeUsed");
  });

  it("includes rate limit headers on success", async () => {
    const res = await GET(req({ lat: "34.7", lng: "32.4" }));
    expect(res.headers.get("X-RateLimit-Remaining")).toBeDefined();
  });

  it("returns 429 when rate limited", async () => {
    mockRateLimit.mockResolvedValue({
      ok: false,
      remaining: 0,
      resetAt: Date.now() + 60_000,
      bypassed: false,
    });

    const res = await GET(req({ lat: "34.7", lng: "32.4" }));
    expect(res.status).toBe(429);
  });

  it("returns 503 when rate limiter throws", async () => {
    mockRateLimit.mockRejectedValue(new Error("redis down"));

    const res = await GET(req({ lat: "34.7", lng: "32.4" }));
    expect(res.status).toBe(503);
  });

  it("respects limit param", async () => {
    const manyItems = Array.from({ length: 10 }, (_, i) => ({
      ...fakeScoredItems[0],
      id: `place-${i}`,
      name: `Place ${i}`,
    }));
    mockScoreAndRank.mockReturnValue(manyItems);
    mockAssignDiscoveryBadges.mockImplementation((items: unknown[]) => items);

    const res = await GET(req({ lat: "34.7", lng: "32.4", limit: "3" }));
    const data = await res.json();
    expect(data.items.length).toBe(3);
  });

  it("caps limit to DEFAULT_ITEM_LIMIT (12)", async () => {
    const manyItems = Array.from({ length: 20 }, (_, i) => ({
      ...fakeScoredItems[0],
      id: `place-${i}`,
      name: `Place ${i}`,
    }));
    mockScoreAndRank.mockReturnValue(manyItems);
    mockAssignDiscoveryBadges.mockImplementation((items: unknown[]) => items);

    const res = await GET(req({ lat: "34.7", lng: "32.4", limit: "50" }));
    const data = await res.json();
    expect(data.items.length).toBeLessThanOrEqual(12);
  });

  it("filters by maxDistance", async () => {
    const items = [
      { ...fakeScoredItems[0], id: "near", distanceKm: 5 },
      { ...fakeScoredItems[0], id: "far", distanceKm: 50 },
    ];
    mockScoreAndRank.mockReturnValue(items);
    mockAssignDiscoveryBadges.mockImplementation((items: unknown[]) => items);

    const res = await GET(req({ lat: "34.7", lng: "32.4", maxDistance: "10" }));
    const data = await res.json();
    expect(data.items.length).toBe(1);
    expect(data.items[0].id).toBe("near");
  });

  it("returns 500 when scoring throws", async () => {
    mockGetWeatherAtCoords.mockRejectedValue(new Error("weather fail"));

    const res = await GET(req({ lat: "34.7", lng: "32.4" }));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error.code).toBe("SERVER_ERROR");
  });

  it("builds reasons with discovery badge and nearby", async () => {
    const item = {
      ...fakeScoredItems[0],
      distanceKm: 3,
      discoveryBadge: "Sunset spot",
    };
    mockScoreAndRank.mockReturnValue([item]);
    mockAssignDiscoveryBadges.mockImplementation((items: unknown[]) => items);

    const res = await GET(req({ lat: "34.7", lng: "32.4" }));
    const data = await res.json();
    expect(data.items[0].reasons).toContain("Sunset spot");
    expect(data.items[0].reasons).toContain("Nearby");
  });
});
