import { describe, expect, it } from "vitest";
import { discoverDetailHref, discoverListHref } from "@/lib/discover-links";

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
});
