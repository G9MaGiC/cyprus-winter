import { describe, expect, it } from "vitest";
import { constantTimeEquals } from "./secret-compare";

describe("constantTimeEquals", () => {
  it("matches equal strings", () => {
    expect(constantTimeEquals("s3cret-value", "s3cret-value")).toBe(true);
    expect(constantTimeEquals("", "")).toBe(true);
  });

  it("rejects different strings, including prefix matches and length differences", () => {
    expect(constantTimeEquals("s3cret-value", "s3cret-valuX")).toBe(false);
    expect(constantTimeEquals("s3cret-value", "s3cret")).toBe(false);
    expect(constantTimeEquals("a", "")).toBe(false);
    expect(constantTimeEquals("Bearer x", "Bearer y")).toBe(false);
  });

  it("is byte-exact (no unicode normalization, no trimming)", () => {
    // NFC "caf\u00e9" vs NFD "cafe\u0301" — visually identical, different bytes
    expect(constantTimeEquals("caf\u00e9", "cafe\u0301")).toBe(false);
    expect(constantTimeEquals(" secret", "secret")).toBe(false);
  });
});
