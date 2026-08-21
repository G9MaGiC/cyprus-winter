import { describe, expect, it } from "vitest";
import { guides } from "@/data/guides";
import {
  getVerifiedPartnerForLicensedId,
  guideSpeaksLocale,
  sortGuidesByLocaleMatch,
  verifiedPartnersByDistrict,
} from "@/lib/guide-partners";

describe("guide-partners", () => {
  it("every verified guide has district and languages", () => {
    for (const g of guides.filter((x) => x.isVerified)) {
      expect(g.district).toBeTruthy();
      expect(g.languages.length).toBeGreaterThan(0);
    }
  });

  it("sorts locale-matching guides first", () => {
    const sorted = sortGuidesByLocaleMatch(guides, "de");
    expect(guideSpeaksLocale(sorted[0]!, "de")).toBe(true);
  });

  it("returns verified partners by district", () => {
    const pafos = verifiedPartnersByDistrict("pafos");
    expect(pafos.length).toBeGreaterThanOrEqual(2);
    expect(pafos.every((g) => g.district === "pafos")).toBe(true);
  });

  it("links licensed directory id when set", () => {
    expect(getVerifiedPartnerForLicensedId("nonexistent")).toBeUndefined();
  });
});
