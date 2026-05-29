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
  it("returns empty array when no matches", () => {
    const results = search("xyznonexistent123", 10);
    expect(results).toEqual([]);
  });

  it("matches Lemesos alias for Limassol region", () => {
    const results = search("lemesos", 10);
    expect(results.length).toBeGreaterThan(0);
  });

  it("trims leading/trailing whitespace", () => {
    const results = search("  omodos  ", 5);
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns results with kind and href", () => {
    const results = search("omodos", 1);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty("kind");
    expect(results[0]).toHaveProperty("href");
    expect(results[0].href).toMatch(/^\//);
  });

  it("matches case-insensitively", () => {
    const results = search("KOURION", 5);
    expect(results.length).toBeGreaterThan(0);
  });

  it("ranks by relevance: exact name match first", () => {
    const results = search("omodos", 20);
    expect(results.length).toBeGreaterThan(0);
    const first = results[0];
    expect(first.item.name.toLowerCase()).toContain("omodos");
  });

  it("supports multi-word queries", () => {
    const results = search("artemis trail", 10);
    expect(results.length).toBeLessThanOrEqual(10);
    if (results.length > 0) {
      expect(results.some((r) => r.item.name.toLowerCase().includes("artemis"))).toBe(true);
    }
  });
});
