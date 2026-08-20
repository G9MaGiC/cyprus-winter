import { describe, expect, it } from "vitest";
import { allDiscoverItems } from "@/data/discover";
import { ACTIVITY_PLACE_IDS_SET } from "@/data/activity-places";
import { ACTIVITY_FILTER_KEYS, buildActivitySection } from "@/lib/activity-catalog";
import {
  buildDiscoverFilterChipGroups,
  buildDiscoverSections,
  filterToSectionId,
  isAccessibleFriendly,
  isFamilyFriendly,
  PRACTICAL_DISCOVER_FILTERS,
} from "@/lib/discover-sections";

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

  it("family section is non-empty and only family-friendly places", () => {
    const family = buildDiscoverSections(allDiscoverItems).find((s) => s.id === "family");
    expect(family?.items.length).toBeGreaterThan(0);
    expect(family?.items.some((item) => item.id === "nissi-beach")).toBe(true);
    for (const item of family!.items) {
      expect(isFamilyFriendly(item), item.id).toBe(true);
    }
  });

  it("accessible section is non-empty and only accessible-friendly places", () => {
    const accessible = buildDiscoverSections(allDiscoverItems).find((s) => s.id === "accessible");
    expect(accessible?.items.length).toBeGreaterThan(0);
    for (const item of accessible!.items) {
      expect(isAccessibleFriendly(item), item.id).toBe(true);
    }
  });

  it("family and accessible lists include sourced winter-practical places", () => {
    const sections = buildDiscoverSections(allDiscoverItems);
    const familyIds = new Set(sections.find((s) => s.id === "family")?.items.map((i) => i.id));
    const accessibleIds = new Set(sections.find((s) => s.id === "accessible")?.items.map((i) => i.id));
    const localIds = new Set(sections.find((s) => s.id === "local")?.items.map((i) => i.id));
    const coastsIds = new Set(sections.find((s) => s.id === "coasts")?.items.map((i) => i.id));
    const ancientIds = new Set(sections.find((s) => s.id === "ancient")?.items.map((i) => i.id));

    expect(familyIds.has("limassol-marina")).toBe(true);
    expect(familyIds.has("athalassa-forest-park")).toBe(true);
    expect(familyIds.has("larnaca-aliki")).toBe(true);

    expect(accessibleIds.has("kourion")).toBe(true);
    expect(accessibleIds.has("kition")).toBe(true);
    expect(accessibleIds.has("leventis-museum")).toBe(true);
    expect(accessibleIds.has("coral-bay")).toBe(true);
    expect(accessibleIds.has("fig-tree-bay")).toBe(true);
    expect(accessibleIds.has("limassol-marina")).toBe(true);
    expect(accessibleIds.has("athalassa-forest-park")).toBe(true);
    expect(accessibleIds.has("larnaca-aliki")).toBe(true);
    expect(accessibleIds.has("choirokoitia")).toBe(false);
    expect(accessibleIds.has("lara-bay")).toBe(false);

    expect(localIds.has("larnaca-aliki")).toBe(true);
    expect(localIds.has("larnaca-salt-lake")).toBe(false);
    expect(coastsIds.has("larnaca-aliki")).toBe(true);
    expect(ancientIds.has("kition")).toBe(true);
  });
});

describe("practical discover filters", () => {
  it("pins family, accessible, and cycling as first-class filters", () => {
    expect([...PRACTICAL_DISCOVER_FILTERS]).toEqual(["family", "accessible", "cycling"]);
    expect(filterToSectionId.family).toBe("family");
    expect(filterToSectionId.accessible).toBe("accessible");
    expect(ACTIVITY_FILTER_KEYS).toContain("cycling");
  });

  it("keeps practical chips out of the buried place and mood lists", () => {
    const groups = buildDiscoverFilterChipGroups(["coasts", "village", "family", "accessible", "wine"]);
    expect(groups.practical).toEqual(["family", "accessible", "cycling"]);
    expect(groups.places).not.toContain("family");
    expect(groups.places).not.toContain("accessible");
    expect(groups.moods).not.toContain("cycling");
    expect(groups.places).toContain("village");
  });

  it("cycling activity filter resolves curated places", () => {
    const section = buildActivitySection("cycling", allDiscoverItems);
    expect(section?.items.length).toBeGreaterThanOrEqual(3);
    expect(section?.items.some((item) => item.id === "troodos-cycling-hub")).toBe(true);
  });
});
