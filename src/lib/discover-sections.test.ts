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
  isOffBeatenPath,
  PRACTICAL_DISCOVER_FILTERS,
  toDiscoverCardItem,
} from "@/lib/discover-sections";
import { wineries } from "@/data/wineries";

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

  it("family lane is curated: audience tokens only, wineries out, villages in (AUD-58)", () => {
    const family = buildDiscoverSections(allDiscoverItems).find((s) => s.id === "family")!;
    const ids = new Set(family.items.map((i) => i.id));

    // Craft villages + the Christmas Village host join via the "Families" tag.
    expect(ids.has("lefkara")).toBe(true);
    expect(ids.has("omodos")).toBe(true);
    expect(ids.has("kalopanagiotis")).toBe(true);

    // Ownership tokens ("Family-run", "Family heritage") are not audience
    // claims — the old substring predicate put these tasting rooms in the
    // children's lane; sterna-boutique's tag edit removes the fourth.
    expect(ids.has("kalamos")).toBe(false);
    expect(ids.has("hadjipavlou")).toBe(false);
    expect(ids.has("adege")).toBe(false);
    expect(ids.has("sterna-boutique")).toBe(false);
  });

  it("family lane leads with the curated order, rest in catalog order", () => {
    const family = buildDiscoverSections(allDiscoverItems).find((s) => s.id === "family")!;
    expect(family.items.slice(0, 3).map((i) => i.id)).toEqual([
      "larnaca-aliki",
      "choirokoitia",
      "fig-tree-bay",
    ]);
  });

  it("family lane carries easy short trails via the trailLinks slot", () => {
    const family = buildDiscoverSections(allDiscoverItems).find((s) => s.id === "family")!;
    const trailIds = family.trailLinks?.map((t) => t.id) ?? [];
    expect(trailIds).toContain("kavos-trail");
    for (const link of family.trailLinks ?? []) {
      expect(link.href).toBe(`/trails/${link.id}`);
      expect(link.name.length).toBeGreaterThan(0);
    }
  });

  it("accessible section is non-empty and only accessible-friendly places", () => {
    const accessible = buildDiscoverSections(allDiscoverItems).find((s) => s.id === "accessible");
    expect(accessible?.items.length).toBeGreaterThan(0);
    for (const item of accessible!.items) {
      expect(isAccessibleFriendly(item), item.id).toBe(true);
    }
  });

  it("hidden gems use editorial bestFor tags only — not localSecret or family union", () => {
    const sections = buildDiscoverSections(allDiscoverItems);
    const hidden = sections.find((s) => s.id === "hidden");
    const family = sections.find((s) => s.id === "family");
    expect(hidden).toBeDefined();
    expect(hidden!.items.length).toBeGreaterThan(0);
    expect(hidden!.items.length).toBeLessThan(allDiscoverItems.length / 2);
    expect(hidden!.items.length).toBeLessThanOrEqual(80);

    for (const item of hidden!.items) {
      expect(isOffBeatenPath(item), item.id).toBe(true);
    }

    // Popular family beach must not appear only because it has tip copy / family tags.
    expect(hidden!.items.some((item) => item.id === "nissi-beach")).toBe(false);
    expect(family!.items.some((item) => item.id === "nissi-beach")).toBe(true);

    // Known editorial off-path villages stay in Hidden.
    expect(hidden!.items.some((item) => item.id === "fikardou")).toBe(true);
    expect(hidden!.items.some((item) => item.id === "lofou")).toBe(true);
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

describe("toDiscoverCardItem call-ahead flag", () => {
  it("prefers a precomputed hoursCallAhead over recomputing on (possibly localized) text", () => {
    const base = wineries.find((w) => w.id === "tsiakkas")!;
    // Simulate the AUD-10 overlay: hours line translated, flag decided on EN base.
    const overlaid = {
      ...base,
      openingHours: "Δευ–Παρ 9:00–17:00 — καλέστε πριν την επίσκεψη",
      hoursCallAhead: true,
    };
    expect(toDiscoverCardItem(overlaid).hoursCallAhead).toBe(true);
    // Raw records still fall back to the EN regex.
    expect(typeof toDiscoverCardItem(base).hoursCallAhead).toBe("boolean");
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
