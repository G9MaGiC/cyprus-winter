import { describe, it, expect } from "vitest";
import {
  scoreDiscoverItem,
  sortDiscoverItemsByInterests,
  scoreTemplate,
  getRecommendedTemplates,
} from "./personalization";

describe("scoreDiscoverItem", () => {
  it("returns 0 when no interests provided", () => {
    const item = { id: "1", type: "beach", bestFor: ["relaxation"] };
    expect(scoreDiscoverItem(item, [])).toBe(0);
  });

  it("scores +2 for type match (beach → wellness)", () => {
    const item = { id: "1", type: "beach" };
    expect(scoreDiscoverItem(item, ["wellness"])).toBe(2);
  });

  it("scores +2 for type match (nature → active)", () => {
    const item = { id: "1", type: "nature" };
    expect(scoreDiscoverItem(item, ["active"])).toBe(2);
  });

  it("scores +3 for bestFor keyword match", () => {
    const item = { id: "1", type: "other", bestFor: ["Hiking trails"] };
    expect(scoreDiscoverItem(item, ["active"])).toBe(3);
  });

  it("scores +5 for both type and bestFor match", () => {
    const item = { id: "1", type: "winery", bestFor: ["Wine tasting"] };
    expect(scoreDiscoverItem(item, ["wine"])).toBe(5); // 2 type + 3 bestFor
  });

  it("accumulates scores across multiple interests", () => {
    const item = { id: "1", type: "village", bestFor: ["Traditional stone village"] };
    // village type → culture +2, villages +2
    // bestFor "traditional stone village" → villages +3 (contains "village"), culture has no keyword match for "traditional"
    const score = scoreDiscoverItem(item, ["culture", "villages"]);
    expect(score).toBeGreaterThanOrEqual(7); // 2+2 type + 3 bestFor villages
  });

  it("returns 0 when no type or bestFor matches", () => {
    const item = { id: "1", type: "unknown", bestFor: ["Something random"] };
    expect(scoreDiscoverItem(item, ["wine"])).toBe(0);
  });

  it("handles missing bestFor", () => {
    const item = { id: "1", type: "beach" };
    expect(scoreDiscoverItem(item, ["wellness"])).toBe(2);
  });

  it("handles empty bestFor array", () => {
    const item = { id: "1", type: "beach", bestFor: [] };
    expect(scoreDiscoverItem(item, ["wellness"])).toBe(2);
  });

  it("bestFor matching is case-insensitive", () => {
    const item = { id: "1", type: "other", bestFor: ["HIKING", "WINE TASTING"] };
    expect(scoreDiscoverItem(item, ["active"])).toBe(3);
    expect(scoreDiscoverItem(item, ["wine"])).toBe(3);
  });

  it("monastery type maps to culture", () => {
    const item = { id: "1", type: "monastery" };
    expect(scoreDiscoverItem(item, ["culture"])).toBe(2);
  });

  it("ancient type maps to culture", () => {
    const item = { id: "1", type: "ancient" };
    expect(scoreDiscoverItem(item, ["culture"])).toBe(2);
  });

  it("nature type maps to both active and wellness", () => {
    const item = { id: "1", type: "nature" };
    expect(scoreDiscoverItem(item, ["active"])).toBe(2);
    expect(scoreDiscoverItem(item, ["wellness"])).toBe(2);
    expect(scoreDiscoverItem(item, ["active", "wellness"])).toBe(4);
  });
});

describe("sortDiscoverItemsByInterests", () => {
  it("returns items unchanged when no interests", () => {
    const items = [
      { id: "1", type: "beach" },
      { id: "2", type: "winery" },
    ];
    const result = sortDiscoverItemsByInterests(items, []);
    expect(result).toEqual(items);
  });

  it("sorts higher-scoring items first", () => {
    const items = [
      { id: "1", type: "other" },
      { id: "2", type: "winery", bestFor: ["Wine tasting"] },
      { id: "3", type: "beach" },
    ];
    const result = sortDiscoverItemsByInterests(items, ["wine"]);
    expect(result[0].id).toBe("2");
  });

  it("does not mutate the original array", () => {
    const items = [
      { id: "1", type: "other" },
      { id: "2", type: "winery" },
    ];
    const original = [...items];
    sortDiscoverItemsByInterests(items, ["wine"]);
    expect(items).toEqual(original);
  });

  it("preserves relative order for same-scored items", () => {
    const items = [
      { id: "1", type: "other" },
      { id: "2", type: "other" },
      { id: "3", type: "other" },
    ];
    const result = sortDiscoverItemsByInterests(items, ["wine"]);
    expect(result.map((i) => i.id)).toEqual(["1", "2", "3"]);
  });
});

describe("scoreTemplate", () => {
  const template = {
    key: "hiking-troodos",
    label: "Hiking in Troodos",
    bestFor: ["Hiking", "Trails", "Active"],
    duration: 5,
  };

  it("scores 0 with no interests and no traveler type", () => {
    expect(scoreTemplate(template, [], null)).toBe(0);
  });

  it("scores for interest keyword match (+3)", () => {
    const t = { key: "t", label: "T", bestFor: ["Mountain hiking"], duration: 3 };
    const score = scoreTemplate(t, ["active"], null);
    expect(score).toBeGreaterThanOrEqual(3);
  });

  it("scores for mapped bestFor label match (+2 additional)", () => {
    // "hiking" label maps to "active" interest
    const t = { key: "t", label: "T", bestFor: ["Hiking"], duration: 3 };
    const score = scoreTemplate(t, ["active"], null);
    expect(score).toBeGreaterThanOrEqual(5); // 3 keyword + 2 mapped
  });

  it("scores +4 for traveler type match", () => {
    const t = { key: "t", label: "T", bestFor: ["Families", "Kids"], duration: 3 };
    const score = scoreTemplate(t, [], "family");
    expect(score).toBe(4);
  });

  it("combines interest and traveler type scores", () => {
    const t = { key: "t", label: "T", bestFor: ["Hiking", "Families"], duration: 3 };
    const score = scoreTemplate(t, ["active"], "family");
    expect(score).toBeGreaterThanOrEqual(9); // 3+2 interest + 4 traveler
  });

  it("traveler type couples matches couple", () => {
    const t = { key: "t", label: "T", bestFor: ["Couples retreat"], duration: 3 };
    const score = scoreTemplate(t, [], "couple");
    expect(score).toBe(4);
  });

  it("nomad/bleisure traveler type matching", () => {
    const t = { key: "t", label: "T", bestFor: ["Nomad friendly"], duration: 3 };
    const score = scoreTemplate(t, [], "nomad");
    expect(score).toBe(4);

    const t2 = { key: "t", label: "T", bestFor: ["Bleisure"], duration: 3 };
    expect(scoreTemplate(t2, [], "nomad")).toBe(4);
  });

  it("bestFor matching is case-insensitive", () => {
    const t = { key: "t", label: "T", bestFor: ["VILLAGES", "WINE"], duration: 3 };
    expect(scoreTemplate(t, ["villages"], null)).toBeGreaterThanOrEqual(3);
    expect(scoreTemplate(t, ["wine"], null)).toBeGreaterThanOrEqual(3);
  });
});

describe("getRecommendedTemplates", () => {
  const templates = [
    { key: "hiking", label: "Hiking", bestFor: ["Hiking", "Trails"], duration: 5 },
    { key: "wine", label: "Wine", bestFor: ["Wine", "Tasting"], duration: 3 },
    { key: "culture", label: "Culture", bestFor: ["History", "Museums"], duration: 4 },
    { key: "generic", label: "Generic", bestFor: ["Sightseeing"], duration: 7 },
  ];

  it("returns empty array when no preferences", () => {
    expect(getRecommendedTemplates(templates, [], null)).toEqual([]);
  });

  it("filters out templates with score 0", () => {
    const result = getRecommendedTemplates(templates, ["wine"], null);
    expect(result.every((t) => t.key !== "generic")).toBe(true);
  });

  it("sorts by score descending", () => {
    const result = getRecommendedTemplates(templates, ["active"], null);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].key).toBe("hiking");
  });

  it("returns templates matching traveler type even with no interests", () => {
    const t = [
      { key: "family", label: "Family", bestFor: ["Families", "Kids"], duration: 5 },
      { key: "other", label: "Other", bestFor: ["Solo"], duration: 3 },
    ];
    const result = getRecommendedTemplates(t, [], "family");
    expect(result.length).toBe(1);
    expect(result[0].key).toBe("family");
  });

  it("preserves generic type T", () => {
    type Extended = { key: string; label: string; bestFor: string[]; duration: number; extra: boolean };
    const ext: Extended[] = [
      { key: "hiking", label: "Hiking", bestFor: ["Hiking"], duration: 5, extra: true },
    ];
    const result = getRecommendedTemplates(ext, ["active"], null);
    expect(result[0].extra).toBe(true);
  });
});
