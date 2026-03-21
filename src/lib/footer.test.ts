import { describe, it, expect } from "vitest";
import { FOOTER_SENTINEL_ID } from "./footer";

describe("FOOTER_SENTINEL_ID", () => {
  it("is a non-empty string", () => {
    expect(typeof FOOTER_SENTINEL_ID).toBe("string");
    expect(FOOTER_SENTINEL_ID.length).toBeGreaterThan(0);
  });

  it("has the expected value", () => {
    expect(FOOTER_SENTINEL_ID).toBe("footer-sentinel");
  });
});
