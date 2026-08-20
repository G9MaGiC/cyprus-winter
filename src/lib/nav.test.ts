import { describe, expect, it } from "vitest";
import { DISCOVER_HUB_PATHS, getPathWithoutLocale, isActive } from "./nav";

describe("getPathWithoutLocale", () => {
  it("strips known locale prefixes", () => {
    expect(getPathWithoutLocale("/de/discover/omodos")).toBe("/discover/omodos");
    expect(getPathWithoutLocale("/el/beaches")).toBe("/beaches");
  });

  it("leaves unprefixed paths unchanged", () => {
    expect(getPathWithoutLocale("/discover")).toBe("/discover");
    expect(getPathWithoutLocale("/")).toBe("/");
  });
});

describe("isActive", () => {
  it("highlights home only on the root", () => {
    expect(isActive("/", "/")).toBe(true);
    expect(isActive("/de", "/")).toBe(true);
    expect(isActive("/discover", "/")).toBe(false);
  });

  it("treats /book flow as Bookings", () => {
    expect(isActive("/book", "/bookings")).toBe(true);
    expect(isActive("/book/winery/tsiakkas", "/bookings")).toBe(true);
    expect(isActive("/de/book/guide/troodos-guides", "/bookings")).toBe(true);
    expect(isActive("/bookings", "/bookings")).toBe(true);
  });

  it("highlights Discover for hub routes", () => {
    for (const hub of DISCOVER_HUB_PATHS) {
      expect(isActive(hub, "/discover")).toBe(true);
      expect(isActive(`${hub}/extra`, "/discover")).toBe(true);
      expect(isActive(`/fr${hub}`, "/discover")).toBe(true);
    }
  });

  it("keeps Discover and trail/plan highlighting unchanged", () => {
    expect(isActive("/discover", "/discover")).toBe(true);
    expect(isActive("/discover/tsiakkas", "/discover")).toBe(true);
    expect(isActive("/trails", "/discover")).toBe(false);
    expect(isActive("/trails/artemis", "/discover")).toBe(false);
    expect(isActive("/plan", "/plan")).toBe(true);
    expect(isActive("/beaches", "/trails")).toBe(false);
    expect(isActive("/beaches", "/plan")).toBe(false);
  });
});
