import { describe, it, expect } from "vitest";
import { expandSearchToken } from "./search-aliases";

describe("expandSearchToken", () => {
  it("includes limassol aliases", () => {
    const tokens = expandSearchToken("limassol");
    expect(tokens).toContain("lemesos");
  });

  it("includes kition alias for Larnaca archaeology", () => {
    expect(expandSearchToken("kition")).toContain("larnaca archaeology");
  });
});
