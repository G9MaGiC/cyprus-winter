import { describe, it, expect } from "vitest";
import { buildTrailHref } from "./trail-url";

describe("buildTrailHref", () => {
  it("returns /trails with no params", () => {
    expect(buildTrailHref({})).toBe("/trails");
  });

  it("adds status param", () => {
    expect(buildTrailHref({ status: "open" })).toBe("/trails?status=open");
  });

  it("adds difficulty param", () => {
    expect(buildTrailHref({ difficulty: "moderate" })).toBe("/trails?difficulty=moderate");
  });

  it("adds region param", () => {
    expect(buildTrailHref({ region: "Troodos" })).toBe("/trails?region=Troodos");
  });

  it("combines multiple params", () => {
    const href = buildTrailHref({ status: "open", difficulty: "hard", region: "Paphos" });
    expect(href).toContain("status=open");
    expect(href).toContain("difficulty=hard");
    expect(href).toContain("region=Paphos");
    expect(href.startsWith("/trails?")).toBe(true);
  });

  it("omits undefined params", () => {
    const href = buildTrailHref({ status: "caution", difficulty: undefined });
    expect(href).toBe("/trails?status=caution");
    expect(href).not.toContain("difficulty");
  });
});
