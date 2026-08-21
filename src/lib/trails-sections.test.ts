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

  it("surfaces official Cape Greco and new Forestry routes in curated sections", () => {
    const byId = Object.fromEntries(buildTrailSections().map((s) => [s.id, s.trails.map((t) => t.id)]));
    expect(byId.coastal).toEqual(
      expect.arrayContaining([
        "konnoi-cyclops",
        "agioi-anargyroi-circular",
        "aphrodite-cape-greco",
        "kavos-trail",
      ])
    );
    expect(byId.waterfall).toContain("trooditissa-phini");
    expect(byId["full-day"]).toEqual(
      expect.arrayContaining(["psilo-dentro-pouziaris", "kannoures-agios-nikolaos"])
    );
  });
});
