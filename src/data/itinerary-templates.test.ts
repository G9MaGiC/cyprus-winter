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

  it("keeps workation weekdays light (AUD-14: one after-work stop max on days 1-5)", () => {
    const workation = ITINERARY_TEMPLATES.find((t) => t.key === "workation");
    expect(workation).toBeDefined();
    for (const day of [1, 2, 3, 4, 5]) {
      expect(
        workation!.days[day]?.length ?? 0,
        `workation day ${day} must stay a remote workday`
      ).toBeLessThanOrEqual(1);
    }
    expect(workation!.days[6]?.length).toBeGreaterThan(1);
    expect(workation!.days[7]?.length).toBeGreaterThan(1);
  });

  it("never pairs Atalante with Omodos on the same template day", () => {
    const offenders: string[] = [];
    for (const template of ITINERARY_TEMPLATES) {
      for (const [day, ids] of Object.entries(template.days)) {
        if (ids.includes("atalante") && ids.includes("omodos")) {
          offenders.push(`${template.key} day ${day}`);
        }
      }
    }
    expect(offenders, offenders.join("\n")).toEqual([]);
  });

  it("never pairs Artemis and Atalante on the same template day", () => {
    const offenders: string[] = [];
    for (const template of ITINERARY_TEMPLATES) {
      for (const [day, ids] of Object.entries(template.days)) {
        if (ids.includes("artemis") && ids.includes("atalante")) {
          offenders.push(`${template.key} day ${day}`);
        }
      }
    }
    expect(offenders, offenders.join("\n")).toEqual([]);
  });
});
