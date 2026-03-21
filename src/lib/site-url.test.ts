import { describe, it, expect } from "vitest";
import { SITE_URL, toAbsoluteUrl } from "./site-url";

describe("SITE_URL", () => {
  it("is a string", () => {
    expect(typeof SITE_URL).toBe("string");
  });

  it("defaults to https://cypruswinter.com when env not set", () => {
    // In test env, NEXT_PUBLIC_SITE_URL is likely unset
    expect(SITE_URL).toBe("https://cypruswinter.com");
  });
});

describe("toAbsoluteUrl", () => {
  it("returns full URL unchanged if it starts with http", () => {
    expect(toAbsoluteUrl("https://example.com/path")).toBe("https://example.com/path");
    expect(toAbsoluteUrl("http://example.com")).toBe("http://example.com");
  });

  it("prepends SITE_URL to a path starting with /", () => {
    expect(toAbsoluteUrl("/about")).toBe(`${SITE_URL}/about`);
    expect(toAbsoluteUrl("/discover/some-place")).toBe(`${SITE_URL}/discover/some-place`);
  });

  it("prepends SITE_URL with / to a bare path", () => {
    expect(toAbsoluteUrl("about")).toBe(`${SITE_URL}/about`);
    expect(toAbsoluteUrl("discover/some-place")).toBe(`${SITE_URL}/discover/some-place`);
  });
});
