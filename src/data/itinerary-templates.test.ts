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
});
