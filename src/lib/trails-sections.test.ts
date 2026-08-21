import { describe, expect, it } from "vitest";
import { buildTrailSections } from "./trails-sections";
import en from "../../messages/en.json";

describe("buildTrailSections", () => {
  it("returns sections with ids that have trails.sections titles", () => {
    const sections = buildTrailSections();
    expect(sections.length).toBeGreaterThan(0);
    const titles = en.trails.sections as Record<string, string>;
    for (const section of sections) {
      expect(titles[section.id], `missing trails.sections.${section.id}`).toBeTruthy();
      expect(section.trails.length).toBeGreaterThan(0);
    }
  });
});
