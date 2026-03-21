import { describe, it, expect, vi } from "vitest";

vi.mock("@/i18n/routing", () => ({
  routing: { locales: ["en", "el", "de", "pl"] },
}));

import { getPathWithoutLocale, isActive } from "./nav";

describe("getPathWithoutLocale", () => {
  it("strips known locale prefix", () => {
    expect(getPathWithoutLocale("/de/discover/omodos")).toBe("/discover/omodos");
    expect(getPathWithoutLocale("/el/bookings")).toBe("/bookings");
    expect(getPathWithoutLocale("/pl/discover")).toBe("/discover");
  });

  it("leaves path unchanged when no locale prefix", () => {
    expect(getPathWithoutLocale("/discover/omodos")).toBe("/discover/omodos");
    expect(getPathWithoutLocale("/bookings")).toBe("/bookings");
  });

  it("leaves path unchanged for unknown locale prefix", () => {
    expect(getPathWithoutLocale("/fr/discover")).toBe("/fr/discover");
  });

  it("handles root path", () => {
    expect(getPathWithoutLocale("/")).toBe("/");
  });

  it("strips locale and returns root for locale-only path", () => {
    expect(getPathWithoutLocale("/en")).toBe("/");
  });

  it("handles empty string", () => {
    expect(getPathWithoutLocale("")).toBe("");
  });
});

describe("isActive", () => {
  it("returns true for exact root match", () => {
    expect(isActive("/", "/")).toBe(true);
  });

  it("returns true for root with locale prefix", () => {
    expect(isActive("/de", "/")).toBe(true);
  });

  it("returns true for exact path match", () => {
    expect(isActive("/discover", "/discover")).toBe(true);
  });

  it("returns true for sub-path match", () => {
    expect(isActive("/discover/omodos", "/discover")).toBe(true);
  });

  it("returns true for localized exact match", () => {
    expect(isActive("/el/discover", "/discover")).toBe(true);
  });

  it("returns true for localized sub-path match", () => {
    expect(isActive("/de/discover/troodos", "/discover")).toBe(true);
  });

  it("returns false when path does not match", () => {
    expect(isActive("/discover", "/bookings")).toBe(false);
  });

  it("returns false for root href when on another page", () => {
    expect(isActive("/discover", "/")).toBe(false);
  });

  it("treats /book as part of /bookings for nav highlighting", () => {
    expect(isActive("/book", "/bookings")).toBe(true);
    expect(isActive("/book/123", "/bookings")).toBe(true);
  });

  it("treats localized /book as part of /bookings", () => {
    expect(isActive("/de/book", "/bookings")).toBe(true);
    expect(isActive("/el/book/456", "/bookings")).toBe(true);
  });

  it("does not partially match similar prefixes", () => {
    expect(isActive("/discovering", "/discover")).toBe(false);
  });
});
