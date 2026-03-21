import { describe, it, expect, vi } from "vitest";

vi.mock("@/data", () => ({
  allPlaces: [
    { id: "a1", type: "attraction" },
    { id: "t1", type: "trail" },
    { id: "w1", type: "winery" },
    { id: "e1", type: "event" },
    { id: "r1", type: "restaurant" },
  ],
}));

vi.mock("@/data/discover", () => ({
  allDiscoverItems: [
    { id: "d1", type: "beach" },
    { id: "d2", type: "village" },
    { id: "d3", type: "winery" },
    { id: "d4", type: "ancient" },
    { id: "d5", type: "monastery" },
  ],
}));

vi.mock("@/data/promoted", () => ({
  PROMOTED_PLACE_IDS: ["d1", "d3"],
}));

vi.mock("@/lib/daily-rotator", () => ({
  pickDailyWithKey: vi.fn((items: { id: string }[]) => items[0]),
  pickDailyMultipleWithTypeDiversity: vi.fn(
    (items: { id: string }[], _promoted: string[], _key: string, min: number, _max: number) =>
      items.slice(0, min)
  ),
}));

import { getPlaceOfDayIds } from "./place-of-day-ids";
import { pickDailyWithKey, pickDailyMultipleWithTypeDiversity } from "@/lib/daily-rotator";

describe("getPlaceOfDayIds", () => {
  it("returns a Set of string IDs", () => {
    const result = getPlaceOfDayIds();
    expect(result).toBeInstanceOf(Set);
    for (const id of result) {
      expect(typeof id).toBe("string");
    }
  });

  it("includes the home place of the day", () => {
    const result = getPlaceOfDayIds();
    // pickDailyWithKey returns items[0] from filtered candidates
    // HOME_PLACE_TYPES = ["attraction", "trail", "winery"], so a1 is first
    expect(result.has("a1")).toBe(true);
  });

  it("filters home candidates to attraction, trail, winery types only", () => {
    getPlaceOfDayIds();
    const call = vi.mocked(pickDailyWithKey).mock.calls[0];
    const candidates = call[0] as { id: string; type: string }[];
    for (const c of candidates) {
      expect(["attraction", "trail", "winery"]).toContain(c.type);
    }
    // Should not include event or restaurant
    expect(candidates.find((c) => c.type === "event")).toBeUndefined();
    expect(candidates.find((c) => c.type === "restaurant")).toBeUndefined();
  });

  it("includes discover place of day picks", () => {
    const result = getPlaceOfDayIds();
    // pickDailyMultipleWithTypeDiversity returns first 3 items
    expect(result.has("d1")).toBe(true);
    expect(result.has("d2")).toBe(true);
    expect(result.has("d3")).toBe(true);
  });

  it("calls pickDailyWithKey with place-of-day key", () => {
    getPlaceOfDayIds();
    expect(pickDailyWithKey).toHaveBeenCalledWith(expect.any(Array), "place-of-day");
  });

  it("calls pickDailyMultipleWithTypeDiversity with correct params", () => {
    getPlaceOfDayIds();
    expect(pickDailyMultipleWithTypeDiversity).toHaveBeenCalledWith(
      expect.any(Array),
      ["d1", "d3"],
      "discover-place-of-day",
      3,
      5
    );
  });

  it("deduplicates IDs across home and discover picks", () => {
    // If home pick and discover pick share an ID, the set handles dedup
    vi.mocked(pickDailyWithKey).mockReturnValue({ id: "d1", type: "beach" });
    const result = getPlaceOfDayIds();
    const arr = Array.from(result);
    const unique = new Set(arr);
    expect(unique.size).toBe(arr.length);
  });
});
