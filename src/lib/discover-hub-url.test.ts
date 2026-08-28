import { describe, expect, it } from "vitest";
import { buildDiscoverHubHref } from "@/lib/discover-hub-url";

describe("buildDiscoverHubHref", () => {
  it("builds plain discover path", () => {
    expect(buildDiscoverHubHref("")).toBe("/discover");
  });

  it("preserves filter param", () => {
    expect(buildDiscoverHubHref("winery")).toBe("/discover?filter=winery");
  });

  it("preserves view=map", () => {
    expect(buildDiscoverHubHref("bouldering", { viewMap: true })).toBe(
      "/discover?filter=bouldering&view=map"
    );
  });

  it("clears filter when requested", () => {
    expect(buildDiscoverHubHref("winery", { clearFilter: true, viewMap: true })).toBe(
      "/discover?view=map"
    );
  });
});
