import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { allDiscoverItems } from "@/data/discover";
import { ACTIVITY_SEE_MORE, buildActivitySection } from "@/lib/activity-catalog";
import { getCyclingHubContent } from "@/lib/cycling-hub";

describe("cycling hub", () => {
  it("lists curated cycling places including Troodos hub", () => {
    const { places, trailLinks } = getCyclingHubContent(allDiscoverItems);
    expect(places.length).toBeGreaterThanOrEqual(3);
    expect(places.some((item) => item.id === "troodos-cycling-hub")).toBe(true);
    expect(trailLinks.length).toBeGreaterThan(0);
  });

  it("points the cycling discover see-more link at the hub", () => {
    expect(ACTIVITY_SEE_MORE.cycling?.href).toBe("/cycling");
    const section = buildActivitySection("cycling", allDiscoverItems);
    expect(section?.seeMore?.href).toBe("/cycling");
  });
});

describe("cycling hub locale proxy", () => {
  it("has a [locale]/cycling page like other hubs", () => {
    const appDir = join(process.cwd(), "src/app");
    expect(existsSync(join(appDir, "[locale]/cycling/page.tsx"))).toBe(true);
    expect(existsSync(join(appDir, "(padded)/cycling/page.tsx"))).toBe(true);
  });
});
