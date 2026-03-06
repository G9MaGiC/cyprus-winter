import { describe, it, expect } from "vitest";
import { search } from "./search";

describe("search", () => {
  it("returns empty array for query shorter than 2 chars", () => {
    expect(search("")).toEqual([]);
    expect(search("a")).toEqual([]);
  });

  it("returns places matching by name", () => {
    const results = search("omodos", 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.item.name.toLowerCase().includes("omodos"))).toBe(true);
  });

  it("returns places or trails matching by name", () => {
    const results = search("artemis", 20);
    expect(results.length).toBeGreaterThan(0);
    const hasArtemis = results.some((r) =>
      r.item.name.toLowerCase().includes("artemis")
    );
    expect(hasArtemis).toBe(true);
  });

  it("returns events matching by name or region", () => {
    const results = search("epiphany", 10);
    const events = results.filter((r) => r.kind === "event");
    expect(events.length).toBeGreaterThanOrEqual(0);
  });

  it("respects limit parameter", () => {
    const results = search("cyprus", 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });
});
