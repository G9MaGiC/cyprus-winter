import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { parseAddParam, patchPlanUrlSearchParams } from "./plan-url-params";

describe("parseAddParam", () => {
  it("returns empty for null, failed, or empty", () => {
    expect(parseAddParam(null)).toEqual([]);
    expect(parseAddParam("failed")).toEqual([]);
    expect(parseAddParam("")).toEqual([]);
  });

  it("parses comma-separated ids", () => {
    expect(parseAddParam("omodos,tsiakkas")).toEqual(["omodos", "tsiakkas"]);
  });
});

/**
 * @vitest-environment jsdom
 */
describe("patchPlanUrlSearchParams", () => {
  const originalHref = "/en/plan?add=tsiakkas";

  beforeEach(() => {
    window.history.replaceState({}, "", originalHref);
  });

  afterEach(() => {
    window.history.replaceState({}, "", "/");
  });

  it("removes add without full navigation", () => {
    patchPlanUrlSearchParams((p) => p.delete("add"));
    expect(window.location.pathname).toBe("/en/plan");
    expect(window.location.search).toBe("");
  });

  it("sets add=failed", () => {
    patchPlanUrlSearchParams((p) => {
      p.delete("add");
      p.set("add", "failed");
    });
    expect(window.location.search).toBe("?add=failed");
  });
});
