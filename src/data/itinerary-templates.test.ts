import { describe, expect, it } from "vitest";
import { getPlaceById } from "@/data";
import { ITINERARY_TEMPLATES } from "@/data/itinerary-templates";

describe("itinerary templates", () => {
  it("resolves every template place id via getPlaceById", () => {
    const issues: string[] = [];
    for (const template of ITINERARY_TEMPLATES) {
      for (const [day, ids] of Object.entries(template.days)) {
        for (const id of ids) {
          if (!getPlaceById(id)) {
            issues.push(`${template.key} day ${day}: ${id}`);
          }
        }
      }
    }
    expect(issues, issues.join("\n")).toEqual([]);
  });

  it("keeps short-stay to two days and a 48-hour stop count", () => {
    const shortStay = ITINERARY_TEMPLATES.find((t) => t.key === "short-stay");
    expect(shortStay).toBeDefined();
    expect(shortStay?.duration).toBe(2);
    const ids = Object.values(shortStay!.days).flat();
    expect(Object.keys(shortStay!.days).map(Number).sort()).toEqual([1, 2]);
    expect(ids).toHaveLength(5);
    expect(ids).toContain("kourion");
    expect(ids).toContain("tsiakkas");
  });
});
