import { describe, it, expect } from "vitest";
import { emptyDays, resolveItineraryHydration } from "@/lib/itinerary-storage";

function daysWith(day1: string[]): Record<number, string[]> {
  const days = emptyDays();
  days[1] = day1;
  return days;
}

describe("resolveItineraryHydration", () => {
  it("adopts a new shared plan over existing storage", () => {
    const fromUrl = daysWith(["pafos-mosaics"]);
    const fromStorage = daysWith(["kourion"]);

    const resolved = resolveItineraryHydration({
      planParam: "1:pafos-mosaics",
      fromUrl,
      fromStorage,
      appliedPlanParam: null,
    });

    expect(resolved.adoptedFromUrl).toBe(true);
    expect(resolved.days[1]).toEqual(["pafos-mosaics"]);
    expect(resolved.nextAppliedPlanParam).toBe("1:pafos-mosaics");
  });

  it("keeps storage when the same share snapshot was already adopted", () => {
    const fromUrl = daysWith(["pafos-mosaics"]);
    const fromStorage = daysWith(["pafos-mosaics", "kourion"]);

    const resolved = resolveItineraryHydration({
      planParam: "1:pafos-mosaics",
      fromUrl,
      fromStorage,
      appliedPlanParam: "1:pafos-mosaics",
    });

    expect(resolved.adoptedFromUrl).toBe(false);
    expect(resolved.days[1]).toEqual(["pafos-mosaics", "kourion"]);
    expect(resolved.nextAppliedPlanParam).toBe("1:pafos-mosaics");
  });

  it("adopts a different share snapshot even if a prior plan was applied", () => {
    const fromUrl = daysWith(["artemis"]);
    const fromStorage = daysWith(["pafos-mosaics", "kourion"]);

    const resolved = resolveItineraryHydration({
      planParam: "1:artemis",
      fromUrl,
      fromStorage,
      appliedPlanParam: "1:pafos-mosaics",
    });

    expect(resolved.adoptedFromUrl).toBe(true);
    expect(resolved.days[1]).toEqual(["artemis"]);
    expect(resolved.nextAppliedPlanParam).toBe("1:artemis");
  });

  it("loads storage when the URL has no plan", () => {
    const fromStorage = daysWith(["kourion"]);

    const resolved = resolveItineraryHydration({
      planParam: null,
      fromUrl: null,
      fromStorage,
      appliedPlanParam: "1:pafos-mosaics",
    });

    expect(resolved.adoptedFromUrl).toBe(false);
    expect(resolved.days[1]).toEqual(["kourion"]);
    expect(resolved.nextAppliedPlanParam).toBe("1:pafos-mosaics");
  });
});
