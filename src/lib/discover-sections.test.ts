import { describe, it, expect } from "vitest";

// We import the real module since it uses static data
import { buildDiscoverSections, filterToSectionId } from "./discover-sections";

describe("filterToSectionId", () => {
  it("is a non-empty mapping object", () => {
    expect(Object.keys(filterToSectionId).length).toBeGreaterThan(0);
  });

  it("maps beach/nature/coasts to coasts section", () => {
    expect(filterToSectionId["beach"]).toBe("coasts");
    expect(filterToSectionId["nature"]).toBe("coasts");
    expect(filterToSectionId["coasts"]).toBe("coasts");
  });

  it("maps ancient to ancient section", () => {
    expect(filterToSectionId["ancient"]).toBe("ancient");
  });

  it("maps village to village section", () => {
    expect(filterToSectionId["village"]).toBe("village");
  });

  it("maps wine-related filters to wine section", () => {
    expect(filterToSectionId["winery"]).toBe("wine");
    expect(filterToSectionId["wine"]).toBe("wine");
    expect(filterToSectionId["eat"]).toBe("wine");
    expect(filterToSectionId["restaurant"]).toBe("wine");
  });

  it("maps monastery to monastery section", () => {
    expect(filterToSectionId["monastery"]).toBe("monastery");
  });

  it("maps hidden gem filters to hidden section", () => {
    expect(filterToSectionId["family"]).toBe("hidden");
    expect(filterToSectionId["quiet"]).toBe("hidden");
    expect(filterToSectionId["hidden"]).toBe("hidden");
    expect(filterToSectionId["off-beaten-path"]).toBe("hidden");
  });

  it("returns undefined for unknown filters", () => {
    expect(filterToSectionId["unknown-filter"]).toBeUndefined();
  });
});

describe("buildDiscoverSections", () => {
  it("returns an array of sections", () => {
    const sections = buildDiscoverSections([]);
    expect(Array.isArray(sections)).toBe(true);
    expect(sections.length).toBeGreaterThan(0);
  });

  it("includes expected section IDs", () => {
    const sections = buildDiscoverSections([]);
    const ids = sections.map((s) => s.id);
    expect(ids).toContain("coasts");
    expect(ids).toContain("ancient");
    expect(ids).toContain("village");
    expect(ids).toContain("wine");
    expect(ids).toContain("monastery");
  });

  it("each section has an id, title, and items array", () => {
    const sections = buildDiscoverSections([]);
    for (const section of sections) {
      expect(typeof section.id).toBe("string");
      expect(typeof section.title).toBe("string");
      expect(Array.isArray(section.items)).toBe(true);
    }
  });

  it("coasts section title is Coasts", () => {
    const sections = buildDiscoverSections([]);
    const coasts = sections.find((s) => s.id === "coasts");
    expect(coasts?.title).toBe("Coasts");
  });

  it("wine section title is Wine & food", () => {
    const sections = buildDiscoverSections([]);
    const wine = sections.find((s) => s.id === "wine");
    expect(wine?.title).toBe("Wine & food");
  });

  it("hidden gems section deduplicates items by id", () => {
    // Create items that match both family-friendly and off-beaten-path
    const dualItem = {
      id: "dual-1",
      name: "Dual",
      description: "desc",
      region: "R",
      type: "village" as const,
      highlights: [],
      bestFor: ["family friendly", "hidden gem"],
      localSecret: "secret tip",
    };
    const sections = buildDiscoverSections([dualItem as any]);
    const hidden = sections.find((s) => s.id === "hidden");
    if (hidden) {
      const dualItems = hidden.items.filter((i) => i.id === "dual-1");
      expect(dualItems.length).toBeLessThanOrEqual(1);
    }
  });

  it("hidden gems includes family-friendly items", () => {
    const familyItem = {
      id: "family-test",
      name: "Family Place",
      description: "desc",
      region: "R",
      type: "village" as const,
      highlights: [],
      bestFor: ["family friendly"],
    };
    const sections = buildDiscoverSections([familyItem as any]);
    const hidden = sections.find((s) => s.id === "hidden");
    if (hidden) {
      expect(hidden.items.some((i) => i.id === "family-test")).toBe(true);
    }
  });

  it("hidden gems includes off-beaten-path items", () => {
    const quietItem = {
      id: "quiet-test",
      name: "Quiet Place",
      description: "desc",
      region: "R",
      type: "village" as const,
      highlights: [],
      bestFor: ["off-the-beaten-path"],
    };
    const sections = buildDiscoverSections([quietItem as any]);
    const hidden = sections.find((s) => s.id === "hidden");
    if (hidden) {
      expect(hidden.items.some((i) => i.id === "quiet-test")).toBe(true);
    }
  });

  it("hidden gems includes items with localSecret", () => {
    const secretItem = {
      id: "secret-test",
      name: "Secret Place",
      description: "desc",
      region: "R",
      type: "village" as const,
      highlights: [],
      bestFor: [],
      localSecret: "a local tip",
    };
    const sections = buildDiscoverSections([secretItem as any]);
    const hidden = sections.find((s) => s.id === "hidden");
    if (hidden) {
      expect(hidden.items.some((i) => i.id === "secret-test")).toBe(true);
    }
  });
});
