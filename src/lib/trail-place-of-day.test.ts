import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/data/trails", () => ({
  trails: [],
  trailConditions: {} as Record<string, any>,
}));

vi.mock("@/lib/daily-rotator", () => ({
  pickDailySafeWithBoost: vi.fn(),
}));

vi.mock("@/data/promoted", () => ({
  PROMOTED_TRAIL_IDS: ["promo-trail-1"],
}));

vi.mock("@/lib/cyprus-images", () => ({
  getTrailImage: vi.fn((id: string) => `/images/trails/${id}.jpg`),
}));

vi.mock("@/data", () => ({
  getPlaceById: vi.fn(),
}));

import { getTrailPlaceOfDayPick } from "./trail-place-of-day";
import { trails, trailConditions } from "@/data/trails";
import { pickDailySafeWithBoost } from "@/lib/daily-rotator";
import { getPlaceById } from "@/data";

beforeEach(() => {
  vi.clearAllMocks();
  (trails as any[]).length = 0;
  // Clear trailConditions
  for (const key of Object.keys(trailConditions)) {
    delete (trailConditions as any)[key];
  }
});

describe("getTrailPlaceOfDayPick", () => {
  it("returns null when pickDailySafeWithBoost returns null", () => {
    vi.mocked(pickDailySafeWithBoost).mockReturnValue(null as any);
    expect(getTrailPlaceOfDayPick()).toBeNull();
  });

  it("returns a pick with correct basic fields", () => {
    const trail = {
      id: "atalanti",
      name: "Atalanti Trail",
      region: "Troodos",
      description: "Circular trail through pine forests. Spectacular views.",
      lengthKm: 12,
      combineWith: [],
    };
    vi.mocked(pickDailySafeWithBoost).mockReturnValue(trail as any);

    const result = getTrailPlaceOfDayPick();
    expect(result).not.toBeNull();
    expect(result!.id).toBe("atalanti");
    expect(result!.name).toBe("Atalanti Trail");
    expect(result!.region).toBe("Troodos");
    expect(result!.href).toBe("/trails/atalanti");
    expect(result!.image).toBe("/images/trails/atalanti.jpg");
    expect(result!.imageAlt).toContain("Atalanti Trail");
    expect(result!.imageAlt).toContain("12 km");
  });

  it("uses first sentence of description as tease", () => {
    const trail = {
      id: "t1",
      name: "Trail",
      region: "R",
      description: "A beautiful nature trail. Perfect in winter.",
      lengthKm: 5,
    };
    vi.mocked(pickDailySafeWithBoost).mockReturnValue(trail as any);

    const result = getTrailPlaceOfDayPick();
    expect(result!.tease).toBe("A beautiful nature trail.");
  });

  it("uses fallback tease when description has no first sentence", () => {
    const trail = {
      id: "t1",
      name: "Trail",
      region: "Troodos",
      description: "",
      lengthKm: 5,
    };
    vi.mocked(pickDailySafeWithBoost).mockReturnValue(trail as any);

    const result = getTrailPlaceOfDayPick();
    expect(result!.tease).toBe("Troodos. Winter hike.");
  });

  it("shows open status with temperature in overlay", () => {
    const trail = {
      id: "t1",
      name: "Trail",
      region: "R",
      description: "Desc.",
      lengthKm: 5,
    };
    (trailConditions as any)["t1"] = { status: "open", temperatureC: 15 };
    vi.mocked(pickDailySafeWithBoost).mockReturnValue(trail as any);

    const result = getTrailPlaceOfDayPick();
    expect(result!.overlay).toBe("15\u00B0C \u00B7 Open");
    expect(result!.status).toBe("open");
    expect(result!.temperatureC).toBe(15);
  });

  it("shows 'Open' without temperature when temperatureC is null", () => {
    const trail = {
      id: "t1",
      name: "Trail",
      region: "R",
      description: "Desc.",
      lengthKm: 5,
    };
    (trailConditions as any)["t1"] = { status: "open", temperatureC: null };
    vi.mocked(pickDailySafeWithBoost).mockReturnValue(trail as any);

    const result = getTrailPlaceOfDayPick();
    expect(result!.overlay).toBe("Open");
  });

  it("shows 'Caution' overlay for caution status", () => {
    const trail = {
      id: "t1",
      name: "Trail",
      region: "R",
      description: "Desc.",
      lengthKm: 5,
    };
    (trailConditions as any)["t1"] = { status: "caution" };
    vi.mocked(pickDailySafeWithBoost).mockReturnValue(trail as any);

    const result = getTrailPlaceOfDayPick();
    expect(result!.overlay).toBe("Caution \u2014 check details");
  });

  it("shows 'See conditions' overlay when no conditions", () => {
    const trail = {
      id: "t1",
      name: "Trail",
      region: "R",
      description: "Desc.",
      lengthKm: 5,
    };
    vi.mocked(pickDailySafeWithBoost).mockReturnValue(trail as any);

    const result = getTrailPlaceOfDayPick();
    expect(result!.overlay).toBe("See conditions");
  });

  it("includes pairWith for trail combineWith", () => {
    const trail = {
      id: "t1",
      name: "Trail",
      region: "R",
      description: "Desc.",
      lengthKm: 5,
      combineWith: ["place-1"],
    };
    vi.mocked(pickDailySafeWithBoost).mockReturnValue(trail as any);
    vi.mocked(getPlaceById).mockReturnValue({
      id: "place-1",
      name: "Nearby Village",
      type: "attraction",
      region: "R",
    } as any);

    const result = getTrailPlaceOfDayPick();
    expect(result!.pairWith).toEqual({
      name: "Nearby Village",
      href: "/discover/place-1",
    });
  });

  it("uses /trails/ href when pairWith is a trail", () => {
    const trail = {
      id: "t1",
      name: "Trail",
      region: "R",
      description: "Desc.",
      lengthKm: 5,
      combineWith: ["trail-2"],
    };
    vi.mocked(pickDailySafeWithBoost).mockReturnValue(trail as any);
    vi.mocked(getPlaceById).mockReturnValue({
      id: "trail-2",
      name: "Other Trail",
      type: "trail",
      region: "R",
    } as any);

    const result = getTrailPlaceOfDayPick();
    expect(result!.pairWith).toEqual({
      name: "Other Trail",
      href: "/trails/trail-2",
    });
  });

  it("omits pairWith when combineWith is undefined", () => {
    const trail = {
      id: "t1",
      name: "Trail",
      region: "R",
      description: "Desc.",
      lengthKm: 5,
    };
    vi.mocked(pickDailySafeWithBoost).mockReturnValue(trail as any);

    const result = getTrailPlaceOfDayPick();
    expect(result!.pairWith).toBeUndefined();
  });

  it("prefers ideal-condition trails for the pool", () => {
    const idealTrail = {
      id: "ideal",
      name: "Ideal",
      region: "R",
      description: "D.",
      lengthKm: 5,
    };
    const badTrail = {
      id: "bad",
      name: "Bad",
      region: "R",
      description: "D.",
      lengthKm: 5,
    };
    (trails as any[]).push(idealTrail, badTrail);
    (trailConditions as any)["ideal"] = { status: "open", surface: "dry", temperatureC: 15 };
    (trailConditions as any)["bad"] = { status: "closed" };

    vi.mocked(pickDailySafeWithBoost).mockReturnValue(idealTrail as any);

    getTrailPlaceOfDayPick();

    // The first argument to pickDailySafeWithBoost should be the ideal pool
    const pool = vi.mocked(pickDailySafeWithBoost).mock.calls[0][0];
    expect(pool.length).toBe(1);
    expect(pool[0].id).toBe("ideal");
  });

  it("falls back to all trails when none have ideal conditions", () => {
    const t1 = { id: "t1", name: "T1", region: "R", description: "D.", lengthKm: 5 };
    const t2 = { id: "t2", name: "T2", region: "R", description: "D.", lengthKm: 3 };
    (trails as any[]).push(t1, t2);
    // No conditions = not ideal

    vi.mocked(pickDailySafeWithBoost).mockReturnValue(t1 as any);

    getTrailPlaceOfDayPick();

    const pool = vi.mocked(pickDailySafeWithBoost).mock.calls[0][0];
    expect(pool.length).toBe(2);
  });
});
