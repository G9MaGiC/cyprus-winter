import { describe, expect, it } from "vitest";
import { allDiscoverItems } from "@/data/discover";
import { ACTIVITY_PLACE_IDS_SET } from "@/data/activity-places";
import { buildDiscoverSections } from "@/lib/discover-sections";

describe("buildDiscoverSections", () => {
  it("excludes curated activity places from default Coasts section", () => {
    const sections = buildDiscoverSections(allDiscoverItems);
    const coasts = sections.find((s) => s.id === "coasts");
    expect(coasts).toBeDefined();
    for (const id of ACTIVITY_PLACE_IDS_SET) {
      expect(
        coasts!.items.some((item) => item.id === id),
        `${id} should not appear in Coasts`
      ).toBe(false);
    }
  });
});
