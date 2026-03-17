import { describe, it, expect } from "vitest";
import {
  navPrimaryLinks,
  navMoreLinks,
  bottomPrimaryLinks,
  bottomOverflowLinks,
} from "./nav-links";

describe("nav links", () => {
  const assertNavLinks = (links: readonly { href: string; labelKey: string }[]) => {
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.href).toMatch(/^\//);
      expect(typeof link.labelKey).toBe("string");
      expect(link.labelKey.length).toBeGreaterThan(0);
    }
  };

  it("navPrimaryLinks has valid structure", () => {
    assertNavLinks(navPrimaryLinks);
  });

  it("navMoreLinks has valid structure", () => {
    assertNavLinks(navMoreLinks);
  });

  it("bottomOverflowLinks has Search", () => {
    const hrefs = bottomOverflowLinks.map((l) => l.href);
    expect(hrefs).toContain("/search");
  });

  it("bottomPrimaryLinks has Home and Discover", () => {
    const hrefs = bottomPrimaryLinks.map((l) => l.href);
    expect(hrefs).toContain("/");
    expect(hrefs).toContain("/discover");
  });
});
