import { describe, expect, it } from "vitest";
import { DEFAULT_PUBLIC_ORIGIN, SITE_URL, toAbsoluteUrl } from "./site-url";

describe("site-url", () => {
  it("defaults to the live public Vercel alias when NEXT_PUBLIC_SITE_URL is unset", () => {
    expect(DEFAULT_PUBLIC_ORIGIN).toBe("https://cyprus-winter-three.vercel.app");
    // In unit tests env is typically unset → SITE_URL equals the default.
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      expect(SITE_URL).toBe(DEFAULT_PUBLIC_ORIGIN);
    }
  });

  it("toAbsoluteUrl prefixes relative paths", () => {
    expect(toAbsoluteUrl("/plan")).toBe(`${SITE_URL}/plan`);
    expect(toAbsoluteUrl("discover")).toBe(`${SITE_URL}/discover`);
  });

  it("toAbsoluteUrl leaves absolute URLs unchanged", () => {
    expect(toAbsoluteUrl("https://example.com/x")).toBe("https://example.com/x");
  });
});
