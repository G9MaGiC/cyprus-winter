import { describe, expect, it } from "vitest";
import { guides } from "@/data/guides";
import { isPartnerVerified } from "@/lib/partner-verification";
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

  it("no draft guide brand passes the central verification gate (BUG-355)", () => {
    // 2026-09-02 verification pass: all seven draft guide brands are
    // unverified and non-public until real, licensed partners onboard
    // (docs/PARTNER_DATA_VERIFICATION_2026-09-02.md). The gate must keep
    // every placeholder-contact record out of verified surfaces.
    expect(guides.every((g) => g.isPublic === false)).toBe(true);
    for (const district of ["pafos", "lemesos", "lefkosia", "larnaka", "ammochostos"] as const) {
      expect(verifiedPartnersByDistrict(district)).toEqual([]);
    }
    expect(guides.filter((g) => isPartnerVerified(g))).toEqual([]);
  });

  it("links licensed directory id when set", () => {
    expect(getVerifiedPartnerForLicensedId("nonexistent")).toBeUndefined();
  });
});
