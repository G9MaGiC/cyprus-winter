import { describe, it, expect } from "vitest";
import { ITINERARY_TEMPLATES } from "./itinerary-templates";
import { getPlaceById } from "@/data";

describe("ITINERARY_TEMPLATES", () => {
  it("only references valid place IDs", () => {
    const invalid: string[] = [];
    for (const template of ITINERARY_TEMPLATES) {
      for (const ids of Object.values(template.days)) {
        for (const id of ids) {
          if (!getPlaceById(id)) invalid.push(`${template.key}:${id}`);
        }
      }
    }
    expect(invalid).toEqual([]);
  });
});
