import { describe, it, expect } from "vitest";
import { expandSearchToken } from "./search-aliases";

describe("expandSearchToken", () => {
  it("includes limassol aliases", () => {
    const tokens = expandSearchToken("limassol");
    expect(tokens).toContain("lemesos");
  });

  it("includes pafos alias for paphos query", () => {
    const tokens = expandSearchToken("paphos");
    expect(tokens.some((t) => t.includes("pafos"))).toBe(true);
  });
});
