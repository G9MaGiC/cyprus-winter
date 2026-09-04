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

  it("only returns district partners that pass the central verification gate", () => {
    const pafos = verifiedPartnersByDistrict("pafos");
    expect(pafos.every((g) => g.district === "pafos" && isPartnerVerified(g))).toBe(true);
    // Self-declared isVerified flags exist in the data, but placeholder
    // partnerEmails must keep them out of "verified" surfaces (AUD A2-05).
    const selfDeclared = guides.filter((g) => g.district === "pafos" && g.isVerified);
    expect(selfDeclared.length).toBeGreaterThanOrEqual(2);
    const unreachable = selfDeclared.filter((g) => !isPartnerVerified(g));
    for (const g of unreachable) {
      expect(pafos).not.toContain(g);
    }
  });

  it("links licensed directory id when set", () => {
    expect(getVerifiedPartnerForLicensedId("nonexistent")).toBeUndefined();
  });
});
