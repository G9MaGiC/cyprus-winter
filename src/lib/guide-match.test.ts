import { describe, expect, it } from "vitest";
import {
  buildGuideDirectoryHref,
  getVerifiedGuidesForTrail,
  matchGuideForTrail,
  matchGuidesForPlanItemIds,
} from "@/lib/guide-match";

describe("guide-match", () => {
  it("finds verified guides for Artemis", () => {
    const matches = getVerifiedGuidesForTrail("artemis");
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((g) => g.isVerified)).toBe(true);
  });

  it("builds directory href with district, language, and source", () => {
    expect(
      buildGuideDirectoryHref({ district: "pafos", language: "english", from: "plan" })
    ).toBe("/guides/directory?district=pafos&lang=english&from=plan");
  });

  it("matches plan trails to verified partners and licensed count", () => {
    const result = matchGuidesForPlanItemIds(["artemis", "omodos"], "en");
    expect(result.trailIds).toEqual(["artemis"]);
    expect(result.verifiedGuides.length).toBeGreaterThan(0);
    expect(result.district).toBe("lemesos");
    expect(result.language).toBe("english");
    expect(result.licensedCount).toBeGreaterThan(0);
  });

  it("returns null district when plan trails span regions", () => {
    const result = matchGuidesForPlanItemIds(["artemis", "adonis"], "en");
    expect(result.trailIds).toEqual(["artemis", "adonis"]);
    expect(result.district).toBeNull();
  });

  it("prefers verified guide for trail when available", () => {
    const { verifiedGuide, directoryHref } = matchGuideForTrail("artemis", "en");
    expect(verifiedGuide).not.toBeNull();
    expect(directoryHref).toContain("district=lemesos");
    expect(directoryHref).toContain("lang=english");
  });
});
