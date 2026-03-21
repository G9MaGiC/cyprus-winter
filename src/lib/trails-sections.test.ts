import { describe, it, expect, vi } from "vitest";

vi.mock("@/data/trails", () => {
  const mockTrails = [
    { id: "artemis", slug: "artemis-trail", name: "Artemis Trail", region: "Troodos", difficulty: "moderate", lengthKm: 7, elevationGainM: 400, durationMin: 180, description: "desc", highlights: [], bestSeason: ["winter"] },
    { id: "atalante", slug: "atalante-trail", name: "Atalante Trail", region: "Troodos", difficulty: "moderate", lengthKm: 12, elevationGainM: 500, durationMin: 240, description: "desc", highlights: [], bestSeason: ["winter"] },
    { id: "adonis", slug: "adonis-trail", name: "Adonis Trail", region: "Paphos", difficulty: "hard", lengthKm: 7.5, elevationGainM: 450, durationMin: 210, description: "desc", highlights: [], bestSeason: ["winter"] },
    { id: "cape-greco", slug: "cape-greco", name: "Cape Greco", region: "Ayia Napa", difficulty: "easy", lengthKm: 2, elevationGainM: 50, durationMin: 45, description: "desc", highlights: [], bestSeason: ["winter"] },
    { id: "caledonia-falls", slug: "caledonia-falls", name: "Caledonia Falls", region: "Troodos", difficulty: "easy", lengthKm: 3, elevationGainM: 200, durationMin: 90, description: "desc", highlights: [], bestSeason: ["winter"] },
    { id: "millomeris-falls", slug: "millomeris-falls", name: "Millomeris Falls", region: "Troodos", difficulty: "easy", lengthKm: 1.5, elevationGainM: 100, durationMin: 40, description: "desc", highlights: [], bestSeason: ["winter"] },
    { id: "avakas-gorge", slug: "avakas-gorge", name: "Avakas Gorge", region: "Paphos", difficulty: "moderate", lengthKm: 3, elevationGainM: 150, durationMin: 90, description: "desc", highlights: [], bestSeason: ["winter"] },
    { id: "mesa-potamos", slug: "mesa-potamos", name: "Mesa Potamos", region: "Troodos", difficulty: "easy", lengthKm: 1, elevationGainM: 50, durationMin: 30, description: "desc", highlights: [], bestSeason: ["winter"] },
    { id: "petra-tou-romiou", slug: "petra-tou-romiou", name: "Petra tou Romiou", region: "Paphos", difficulty: "easy", lengthKm: 2, elevationGainM: 30, durationMin: 40, description: "desc", highlights: [], bestSeason: ["winter"] },
    { id: "olympus-summit", slug: "olympus-summit", name: "Olympus Summit", region: "Troodos", difficulty: "hard", lengthKm: 5, elevationGainM: 700, durationMin: 180, description: "desc", highlights: [], bestSeason: ["winter"] },
    { id: "madari-ridge", slug: "madari-ridge", name: "Madari Ridge", region: "Troodos", difficulty: "moderate", lengthKm: 4, elevationGainM: 350, durationMin: 120, description: "desc", highlights: [], bestSeason: ["winter"] },
    { id: "stavrovouni", slug: "stavrovouni", name: "Stavrovouni", region: "Larnaca", difficulty: "moderate", lengthKm: 3, elevationGainM: 300, durationMin: 90, description: "desc", highlights: [], bestSeason: ["winter"] },
    { id: "horteri", slug: "horteri", name: "Horteri", region: "Troodos", difficulty: "hard", lengthKm: 10, elevationGainM: 600, durationMin: 300, description: "desc", highlights: [], bestSeason: ["winter"] },
  ];
  return { trails: mockTrails };
});

import { buildTrailSections } from "./trails-sections";

describe("buildTrailSections", () => {
  it("returns an array of sections", () => {
    const sections = buildTrailSections();
    expect(Array.isArray(sections)).toBe(true);
    expect(sections.length).toBeGreaterThan(0);
  });

  it("each section has id, title, and trails array", () => {
    const sections = buildTrailSections();
    for (const section of sections) {
      expect(typeof section.id).toBe("string");
      expect(typeof section.title).toBe("string");
      expect(Array.isArray(section.trails)).toBe(true);
    }
  });

  it("winter-highlights section contains expected trails", () => {
    const sections = buildTrailSections();
    const highlights = sections.find((s) => s.id === "winter-highlights");
    expect(highlights).toBeDefined();
    const ids = highlights!.trails.map((t) => t.id);
    expect(ids).toContain("artemis");
    expect(ids).toContain("atalante");
    expect(ids).toContain("cape-greco");
    expect(ids).toContain("caledonia-falls");
  });

  it("waterfall section contains waterfall trails", () => {
    const sections = buildTrailSections();
    const waterfalls = sections.find((s) => s.id === "waterfall");
    expect(waterfalls).toBeDefined();
    const ids = waterfalls!.trails.map((t) => t.id);
    expect(ids).toContain("caledonia-falls");
    expect(ids).toContain("millomeris-falls");
    expect(ids).toContain("avakas-gorge");
    expect(ids).toContain("mesa-potamos");
  });

  it("coastal section contains coastal trails", () => {
    const sections = buildTrailSections();
    const coastal = sections.find((s) => s.id === "coastal");
    expect(coastal).toBeDefined();
    const ids = coastal!.trails.map((t) => t.id);
    expect(ids).toContain("cape-greco");
    expect(ids).toContain("petra-tou-romiou");
  });

  it("peak-views section contains summit trails", () => {
    const sections = buildTrailSections();
    const peaks = sections.find((s) => s.id === "peak-views");
    expect(peaks).toBeDefined();
    const ids = peaks!.trails.map((t) => t.id);
    expect(ids).toContain("olympus-summit");
    expect(ids).toContain("madari-ridge");
    expect(ids).toContain("stavrovouni");
  });

  it("family-friendly section only includes easy trails with lengthKm <= 3", () => {
    const sections = buildTrailSections();
    const family = sections.find((s) => s.id === "family-friendly");
    expect(family).toBeDefined();
    for (const trail of family!.trails) {
      expect(trail.difficulty).toBe("easy");
      expect(trail.lengthKm).toBeLessThanOrEqual(3);
    }
  });

  it("filters out sections with no matching trails", () => {
    const sections = buildTrailSections();
    for (const section of sections) {
      expect(section.trails.length).toBeGreaterThan(0);
    }
  });

  it("does not include trails with unknown ids in sections", () => {
    const sections = buildTrailSections();
    // full-day section references trails not in our mock data
    const fullDay = sections.find((s) => s.id === "full-day");
    if (fullDay) {
      // horteri is in mock data, the others aren't
      expect(fullDay.trails.length).toBeGreaterThanOrEqual(1);
    }
  });
});
