import { describe, it, expect } from "vitest";
import { parseAddParam } from "./plan-url-params";

describe("parseAddParam", () => {
  it("returns empty array for null", () => {
    expect(parseAddParam(null)).toEqual([]);
  });

  it("returns empty array for failed", () => {
    expect(parseAddParam("failed")).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(parseAddParam("")).toEqual([]);
  });

  it("parses single id", () => {
    expect(parseAddParam("tsiakkas")).toEqual(["tsiakkas"]);
  });

  it("parses comma-separated ids", () => {
    expect(parseAddParam("tsiakkas,omodos")).toEqual(["tsiakkas", "omodos"]);
  });

  it("trims whitespace", () => {
    expect(parseAddParam(" tsiakkas , omodos ")).toEqual(["tsiakkas", "omodos"]);
  });

  it("filters empty segments", () => {
    expect(parseAddParam("tsiakkas,,omodos")).toEqual(["tsiakkas", "omodos"]);
  });

  it("deduplicates ids", () => {
    expect(parseAddParam("tsiakkas,omodos,tsiakkas")).toEqual(["tsiakkas", "omodos"]);
  });

  it("caps at 50 ids", () => {
    const ids = Array.from({ length: 60 }, (_, i) => `id${i}`).join(",");
    const result = parseAddParam(ids);
    expect(result).toHaveLength(50);
    expect(result[0]).toBe("id0");
    expect(result[49]).toBe("id49");
  });
});
