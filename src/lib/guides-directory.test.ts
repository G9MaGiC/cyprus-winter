import { describe, expect, it } from "vitest";
import {
  districtForTrailRegion,
  filterLicensedGuides,
  formatGuideName,
  licensedGuideCount,
} from "@/lib/guides-directory";

describe("guides-directory", () => {
  it("loads licensed guides from official PDF export", () => {
    expect(licensedGuideCount()).toBeGreaterThanOrEqual(200);
  });

  it("filters by district and language", () => {
    const troodos = filterLicensedGuides({ district: "lemesos", language: "english" });
    expect(troodos.length).toBeGreaterThan(0);
    for (const g of troodos) {
      expect(g.district).toBe("lemesos");
      expect(g.languages).toContain("english");
    }
  });

  it("maps trail regions to districts", () => {
    expect(districtForTrailRegion("Troodos")).toBe("lemesos");
    expect(districtForTrailRegion("Paphos & Akamas")).toBe("pafos");
  });

  it("title-cases ALL CAPS names", () => {
    expect(formatGuideName("ABDOUL SAMAD DIMA")).toBe("Abdoul Samad Dima");
    expect(formatGuideName("Monika Graczyk")).toBe("Monika Graczyk");
  });
});
