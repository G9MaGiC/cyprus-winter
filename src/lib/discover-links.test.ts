import { describe, expect, it } from "vitest";
import { createSearchResultLink, discoverDetailHref, discoverListHref } from "@/lib/discover-links";

describe("discover-links", () => {
  it("discoverListHref preserves filter", () => {
    expect(discoverListHref("climbing")).toBe("/discover?filter=climbing");
    expect(discoverListHref(null)).toBe("/discover");
  });

  it("discoverDetailHref includes from and filter for back navigation", () => {
    expect(discoverDetailHref("gerakopetra-boulders", "bouldering")).toBe(
      "/discover/gerakopetra-boulders?from=discover&filter=bouldering"
    );
    expect(discoverDetailHref("omodos", null)).toBe(
      "/discover/omodos?from=discover"
    );
  });

  it("adds search context before event hash fragments", () => {
    expect(
      createSearchResultLink("/events#limassol-carnival", "limassol-carnival", "carnival")
    ).toBe("/events?from=search&q=carnival#limassol-carnival");
  });

  it("keeps detail result search links on the detail path", () => {
    expect(createSearchResultLink("/discover/omodos", "omodos", "omodos")).toBe(
      "/discover/omodos?from=search&q=omodos"
    );
  });
});
