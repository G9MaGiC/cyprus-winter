import { describe, it, expect } from "vitest";
import {
  getDailySeed,
  pickDaily,
  pickDailyWithKey,
  pickDailySafe,
  pickDailySafeWithBoost,
  pickDailyMultipleWithTypeDiversity,
} from "./daily-rotator";

const items: { id: string; type: string }[] = [
  { id: "a", type: "beach" },
  { id: "b", type: "beach" },
  { id: "c", type: "village" },
  { id: "d", type: "village" },
  { id: "e", type: "winery" },
  { id: "f", type: "winery" },
];

describe("getDailySeed", () => {
  it("returns YYYY-M-D format", () => {
    const s = getDailySeed();
    expect(s).toMatch(/^\d{4}-\d{1,2}-\d{1,2}$/);
  });
});

describe("pickDaily", () => {
  it("returns same item for same seed", () => {
    const a = pickDaily([1, 2, 3], "2025-1-15");
    const b = pickDaily([1, 2, 3], "2025-1-15");
    expect(a).toBe(b);
  });

  it("returns different items for different seeds", () => {
    const results = new Set(
      ["2025-1-15", "2025-1-16", "2025-1-17", "2025-2-1"].map((s) =>
        pickDaily([1, 2, 3, 4, 5], s)
      )
    );
    expect(results.size).toBeGreaterThan(1);
  });
});

describe("pickDailyWithKey", () => {
  it("returns same item for same seed and key", () => {
    const a = pickDailyWithKey([1, 2, 3], "place", "2025-1-15");
    const b = pickDailyWithKey([1, 2, 3], "place", "2025-1-15");
    expect(a).toBe(b);
  });

  it("returns different items for different keys", () => {
    const a = pickDailyWithKey([1, 2, 3, 4, 5], "place", "2025-1-15");
    const b = pickDailyWithKey([1, 2, 3, 4, 5], "tip", "2025-1-15");
    expect(a).not.toBe(b);
  });
});

describe("pickDailySafe", () => {
  it("returns null for empty array", () => {
    expect(pickDailySafe([])).toBeNull();
  });

  it("returns item for non-empty array", () => {
    const r = pickDailySafe([1, 2, 3], "key", "2025-1-15");
    expect([1, 2, 3]).toContain(r);
  });
});

describe("pickDailySafeWithBoost", () => {
  it("returns null for empty array", () => {
    expect(pickDailySafeWithBoost([], ["a"], "key")).toBeNull();
  });

  it("returns promoted item more often over many seeds", () => {
    const counts: Record<string, number> = {};
    for (let d = 1; d <= 31; d++) {
      const seed = `2025-1-${d}`;
      const picked = pickDailySafeWithBoost(
        items,
        ["a"],
        "key",
        5,
        seed
      );
      counts[picked!.id] = (counts[picked!.id] ?? 0) + 1;
    }
    expect(counts["a"] ?? 0).toBeGreaterThan(counts["b"] ?? 0);
  });
});

describe("pickDailyMultipleWithTypeDiversity", () => {
  it("returns empty for empty array", () => {
    expect(pickDailyMultipleWithTypeDiversity([], ["a"], "key", 3)).toEqual([]);
  });

  it("returns empty for count 0", () => {
    expect(
      pickDailyMultipleWithTypeDiversity(items, [], "key", 0)
    ).toEqual([]);
  });

  it("returns up to count items", () => {
    const result = pickDailyMultipleWithTypeDiversity(
      items,
      [],
      "key",
      3,
      5,
      "2025-1-15"
    );
    expect(result.length).toBe(3);
    expect(result.every((r) => items.some((i) => i.id === r.id))).toBe(true);
  });

  it("returns no duplicate ids", () => {
    const result = pickDailyMultipleWithTypeDiversity(
      items,
      [],
      "key",
      3,
      5,
      "2025-1-15"
    );
    const ids = result.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("prefers different types for secondary picks", () => {
    const result = pickDailyMultipleWithTypeDiversity(
      items,
      [],
      "key",
      3,
      5,
      "2025-1-20"
    );
    const types = result.map((r) => r.type);
    const uniqueTypes = new Set(types);
    expect(uniqueTypes.size).toBeGreaterThanOrEqual(2);
  });

  it("is deterministic for same seed", () => {
    const a = pickDailyMultipleWithTypeDiversity(
      items,
      ["a"],
      "key",
      3,
      5,
      "2025-1-15"
    );
    const b = pickDailyMultipleWithTypeDiversity(
      items,
      ["a"],
      "key",
      3,
      5,
      "2025-1-15"
    );
    expect(a.map((x) => x.id)).toEqual(b.map((x) => x.id));
  });
});
