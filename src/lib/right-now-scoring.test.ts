import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock all external data dependencies
vi.mock("@/data", () => ({
  allPlaces: [],
  getAttractionById: vi.fn(() => null),
  getRestaurantById: vi.fn(() => null),
  getPlaceById: vi.fn(() => null),
}));

vi.mock("@/lib/place-coords", () => ({
  getPlaceCoords: vi.fn(() => ({ lat: 35.0, lng: 33.0 })),
}));

vi.mock("@/data/regions", () => ({
  itemMatchesRegion: vi.fn(() => true),
}));

vi.mock("@/lib/right-now-buckets", () => ({
  getTimeBucket: vi.fn(() => "afternoon"),
  getPlaceTimeSignals: vi.fn(() => ["afternoon"]),
  matchesTimeBucket: vi.fn((preferred: string[], current: string) => preferred.includes(current)),
  isAdjacentBucket: vi.fn(() => false),
}));

vi.mock("@/lib/daily-rotator", () => ({
  pickDailyWithKey: vi.fn((items: any[]) => items[0] ?? { id: "none" }),
}));

vi.mock("@/lib/place-of-day-ids", () => ({
  getPlaceOfDayIds: vi.fn(() => new Set<string>()),
}));

vi.mock("@/lib/weather-live", () => ({}));

vi.mock("@/data/trails", () => ({
  trails: [],
}));

vi.mock("@/data/wineries", () => ({
  wineries: [],
}));

vi.mock("@/data/events", () => ({
  winterEvents: [],
}));

import { scoreAndRank, assignDiscoveryBadges, type ScoredPlace } from "./right-now-scoring";
import { allPlaces } from "@/data";
import { getPlaceCoords } from "@/lib/place-coords";
import { getTimeBucket } from "@/lib/right-now-buckets";
import { pickDailyWithKey } from "@/lib/daily-rotator";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("scoreAndRank", () => {
  it("returns empty array when no places exist", () => {
    vi.mocked(allPlaces).length = 0;
    const result = scoreAndRank(35.0, 33.0, null, 12);
    expect(result).toEqual([]);
  });

  it("filters out places without coords", () => {
    const places = [
      { id: "a", name: "A", type: "attraction", region: "Paphos" },
      { id: "b", name: "B", type: "trail", region: "Troodos" },
    ];
    (allPlaces as any).splice(0, allPlaces.length, ...places);
    vi.mocked(getPlaceCoords)
      .mockReturnValueOnce({ lat: 35.0, lng: 33.0 })
      .mockReturnValueOnce(null);

    const result = scoreAndRank(35.0, 33.0, null, 12);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("a");
  });

  it("respects limit parameter", () => {
    const places = Array.from({ length: 20 }, (_, i) => ({
      id: `p${i}`, name: `Place ${i}`, type: "attraction", region: "Paphos",
    }));
    (allPlaces as any).splice(0, allPlaces.length, ...places);
    vi.mocked(getPlaceCoords).mockReturnValue({ lat: 35.0, lng: 33.0 });

    const result = scoreAndRank(35.0, 33.0, null, 5);
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it("includes score and distanceKm in results", () => {
    const places = [{ id: "a", name: "A", type: "attraction", region: "Paphos" }];
    (allPlaces as any).splice(0, allPlaces.length, ...places);
    vi.mocked(getPlaceCoords).mockReturnValue({ lat: 35.0, lng: 33.0 });

    const result = scoreAndRank(35.0, 33.0, null, 12);
    expect(result[0]).toHaveProperty("score");
    expect(result[0]).toHaveProperty("distanceKm");
    expect(typeof result[0].score).toBe("number");
    expect(typeof result[0].distanceKm).toBe("number");
  });

  it("only includes eligible types", () => {
    const places = [
      { id: "a", name: "A", type: "attraction", region: "R" },
      { id: "b", name: "B", type: "unknowntype", region: "R" },
      { id: "c", name: "C", type: "trail", region: "R" },
    ];
    (allPlaces as any).splice(0, allPlaces.length, ...places);
    vi.mocked(getPlaceCoords).mockReturnValue({ lat: 35.0, lng: 33.0 });

    const result = scoreAndRank(35.0, 33.0, null, 12);
    const ids = result.map((r) => r.id);
    expect(ids).toContain("a");
    expect(ids).toContain("c");
    expect(ids).not.toContain("b");
  });
});

describe("assignDiscoveryBadges", () => {
  function makeScoredPlace(overrides: Partial<ScoredPlace> = {}): ScoredPlace {
    return {
      id: "p1",
      name: "Place",
      type: "attraction",
      region: "Paphos",
      score: 0.5,
      distanceKm: 10,
      timeOfDayMatch: "afternoon",
      preferredBuckets: ["afternoon"],
      coords: { lat: 35.0, lng: 33.0 },
      ...overrides,
    };
  }

  it("assigns 'Trending today' to one item", () => {
    const items = [
      makeScoredPlace({ id: "a" }),
      makeScoredPlace({ id: "b" }),
    ];
    const result = assignDiscoveryBadges(items);
    const trending = result.filter((r) => r.discoveryBadge === "Trending today");
    expect(trending.length).toBe(1);
  });

  it("assigns 'Hidden gem near you' for local secret within 25km", () => {
    vi.mocked(getTimeBucket).mockReturnValue("morning");
    vi.mocked(pickDailyWithKey).mockReturnValue({ id: "other" } as any);
    const items = [
      makeScoredPlace({ id: "a", localSecret: "A hidden spot", distanceKm: 10 }),
    ];

    const result = assignDiscoveryBadges(items);
    expect(result[0].discoveryBadge).toBe("Hidden gem near you");
  });

  it("assigns 'Only locals know this spot' for local secret > 25km", () => {
    vi.mocked(getTimeBucket).mockReturnValue("morning");
    vi.mocked(pickDailyWithKey).mockReturnValue({ id: "other" } as any);
    const items = [
      makeScoredPlace({ id: "a", localSecret: "A hidden spot", distanceKm: 30 }),
    ];

    const result = assignDiscoveryBadges(items);
    expect(result[0].discoveryBadge).toBe("Only locals know this spot");
  });

  it("assigns 'Perfect for sunset today' at sunset with clear weather", () => {
    vi.mocked(getTimeBucket).mockReturnValue("sunset");
    vi.mocked(pickDailyWithKey).mockReturnValue({ id: "other" } as any);
    const items = [
      makeScoredPlace({ id: "a", effectiveType: "beach" }),
    ];

    const result = assignDiscoveryBadges(items, { precipitationMm: 0, maxC: 18 } as any);
    expect(result[0].discoveryBadge).toBe("Perfect for sunset today");
  });

  it("does not assign sunset badge when raining", () => {
    vi.mocked(getTimeBucket).mockReturnValue("sunset");
    vi.mocked(pickDailyWithKey).mockReturnValue({ id: "other" } as any);
    const items = [
      makeScoredPlace({ id: "a", effectiveType: "beach" }),
    ];

    const result = assignDiscoveryBadges(items, { precipitationMm: 5, maxC: 18 } as any);
    expect(result[0].discoveryBadge).not.toBe("Perfect for sunset today");
  });

  it("assigns null badge when no conditions match", () => {
    vi.mocked(getTimeBucket).mockReturnValue("morning");
    vi.mocked(pickDailyWithKey).mockReturnValue({ id: "other" } as any);
    const items = [
      makeScoredPlace({ id: "a" }),
    ];

    const result = assignDiscoveryBadges(items);
    expect(result[0].discoveryBadge).toBeNull();
  });

  it("returns empty array for empty input", () => {
    const result = assignDiscoveryBadges([]);
    expect(result).toEqual([]);
  });
});
