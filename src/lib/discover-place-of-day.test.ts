import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/data", () => ({
  getPlaceById: vi.fn(),
}));

vi.mock("@/lib/cyprus-images", () => ({
  getAttractionImage: vi.fn((id: string, type: string) => `/images/${type}/${id}.jpg`),
}));

vi.mock("@/lib/daily-rotator", () => ({
  pickDailyMultipleWithTypeDiversity: vi.fn(),
}));

vi.mock("@/data/promoted", () => ({
  PROMOTED_PLACE_IDS: ["promoted-1", "promoted-2"],
}));

import { getDiscoverPlaceOfDayPicks } from "./discover-place-of-day";
import { getPlaceById } from "@/data";
import { pickDailyMultipleWithTypeDiversity } from "@/lib/daily-rotator";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getDiscoverPlaceOfDayPicks", () => {
  it("returns empty array when no discover items", () => {
    expect(getDiscoverPlaceOfDayPicks([])).toEqual([]);
  });

  it("returns picks with correct fields", () => {
    const mockItems = [
      {
        id: "place-1",
        name: "Kourion",
        region: "Limassol",
        type: "ancient",
        description: "Ancient theatre with stunning views. Built by Romans.",
      },
    ];
    vi.mocked(pickDailyMultipleWithTypeDiversity).mockReturnValue(mockItems);

    const result = getDiscoverPlaceOfDayPicks(mockItems);
    expect(result.length).toBe(1);
    expect(result[0]).toMatchObject({
      id: "place-1",
      name: "Kourion",
      region: "Limassol",
      type: "ancient",
      href: "/discover/place-1",
      image: "/images/ancient/place-1.jpg",
      imageAlt: "Kourion, Limassol — Cyprus winter",
    });
  });

  it("uses winterTip as tease when available", () => {
    const mockItems = [
      {
        id: "p1",
        name: "Place",
        region: "R",
        type: "village",
        description: "A village.",
        winterTip: "Best visited in January.",
      },
    ];
    vi.mocked(pickDailyMultipleWithTypeDiversity).mockReturnValue(mockItems);

    const result = getDiscoverPlaceOfDayPicks(mockItems);
    expect(result[0].tease).toBe("Best visited in January.");
  });

  it("truncates long teases to 100 chars with ellipsis", () => {
    const longDesc = "A".repeat(200) + ". Second sentence.";
    const mockItems = [
      { id: "p1", name: "Place", region: "R", type: "village", description: longDesc },
    ];
    vi.mocked(pickDailyMultipleWithTypeDiversity).mockReturnValue(mockItems);

    const result = getDiscoverPlaceOfDayPicks(mockItems);
    expect(result[0].tease.length).toBeLessThanOrEqual(100);
  });

  it("uses first sentence of description as tease", () => {
    const mockItems = [
      {
        id: "p1",
        name: "Place",
        region: "R",
        type: "winery",
        description: "Award-winning wines. Open daily.",
      },
    ];
    vi.mocked(pickDailyMultipleWithTypeDiversity).mockReturnValue(mockItems);

    const result = getDiscoverPlaceOfDayPicks(mockItems);
    expect(result[0].tease).toBe("Award-winning wines.");
  });

  it("uses type-specific overlay", () => {
    const mockItems = [
      { id: "p1", name: "P", region: "R", type: "winery", description: "D." },
    ];
    vi.mocked(pickDailyMultipleWithTypeDiversity).mockReturnValue(mockItems);

    const result = getDiscoverPlaceOfDayPicks(mockItems);
    expect(result[0].overlay).toBe("Quiet this week");
  });

  it("uses 'Worth a visit' as default overlay for unknown type", () => {
    const mockItems = [
      { id: "p1", name: "P", region: "R", type: "unknowntype", description: "D." },
    ];
    vi.mocked(pickDailyMultipleWithTypeDiversity).mockReturnValue(mockItems);

    const result = getDiscoverPlaceOfDayPicks(mockItems);
    expect(result[0].overlay).toBe("Worth a visit");
  });

  it("includes pairWith when combineWith has a valid place", () => {
    const mockItems = [
      {
        id: "p1",
        name: "Place",
        region: "R",
        type: "village",
        description: "D.",
        combineWith: ["trail-1"],
      },
    ];
    vi.mocked(pickDailyMultipleWithTypeDiversity).mockReturnValue(mockItems);
    vi.mocked(getPlaceById).mockReturnValue({
      id: "trail-1",
      name: "Nature Trail",
      type: "trail",
      region: "Troodos",
    } as any);

    const result = getDiscoverPlaceOfDayPicks(mockItems);
    expect(result[0].pairWith).toEqual({
      name: "Nature Trail",
      href: "/trails/trail-1",
    });
  });

  it("uses /discover/ href for non-trail pair", () => {
    const mockItems = [
      {
        id: "p1",
        name: "Place",
        region: "R",
        type: "village",
        description: "D.",
        combineWith: ["winery-1"],
      },
    ];
    vi.mocked(pickDailyMultipleWithTypeDiversity).mockReturnValue(mockItems);
    vi.mocked(getPlaceById).mockReturnValue({
      id: "winery-1",
      name: "Wine House",
      type: "winery",
      region: "Limassol",
    } as any);

    const result = getDiscoverPlaceOfDayPicks(mockItems);
    expect(result[0].pairWith).toEqual({
      name: "Wine House",
      href: "/discover/winery-1",
    });
  });

  it("omits pairWith when combineWith is empty", () => {
    const mockItems = [
      { id: "p1", name: "P", region: "R", type: "village", description: "D.", combineWith: [] },
    ];
    vi.mocked(pickDailyMultipleWithTypeDiversity).mockReturnValue(mockItems);

    const result = getDiscoverPlaceOfDayPicks(mockItems);
    expect(result[0].pairWith).toBeUndefined();
  });

  it("omits pairWith when combineWith place not found", () => {
    const mockItems = [
      { id: "p1", name: "P", region: "R", type: "village", description: "D.", combineWith: ["nonexistent"] },
    ];
    vi.mocked(pickDailyMultipleWithTypeDiversity).mockReturnValue(mockItems);
    vi.mocked(getPlaceById).mockReturnValue(undefined as any);

    const result = getDiscoverPlaceOfDayPicks(mockItems);
    expect(result[0].pairWith).toBeUndefined();
  });

  it("calls pickDailyMultipleWithTypeDiversity with correct params", () => {
    const items = [{ id: "a", name: "A", region: "R", type: "t", description: "D." }];
    vi.mocked(pickDailyMultipleWithTypeDiversity).mockReturnValue([]);

    getDiscoverPlaceOfDayPicks(items);

    expect(pickDailyMultipleWithTypeDiversity).toHaveBeenCalledWith(
      items,
      ["promoted-1", "promoted-2"],
      "discover-place-of-day",
      3,
      5
    );
  });
});
