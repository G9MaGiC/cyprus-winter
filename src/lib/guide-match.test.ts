import { describe, expect, it, vi } from "vitest";
import type { Guide } from "@/data/guides";

/**
 * Fixture guides stand in for the data layer: since the 2026-09-02
 * verification pass (docs/PARTNER_DATA_VERIFICATION_2026-09-02.md) the real
 * catalog carries zero verified partners, so matching logic is pinned against
 * fixtures with deliverable (non-placeholder) contact domains instead.
 */
vi.mock("@/data/guides", () => {
  const guides: Guide[] = [
    {
      id: "fixture-guide-en",
      name: "Fixture Guide EN",
      region: "Troodos",
      district: "lemesos",
      description: "Fixture",
      languages: ["english"],
      trailIds: ["artemis"],
      isVerified: true,
      partnerEmail: "guide-en@fixture-guides.example.org",
    },
    {
      id: "fixture-guide-de",
      name: "Fixture Guide DE",
      region: "Troodos",
      district: "lemesos",
      description: "Fixture",
      languages: ["german", "english"],
      trailIds: ["artemis"],
      isVerified: true,
      partnerEmail: "guide-de@fixture-guides.example.org",
    },
    {
      id: "fixture-guide-draft",
      name: "Fixture Guide Draft",
      region: "Troodos",
      district: "lemesos",
      description: "Fixture",
      languages: ["english"],
      trailIds: ["artemis"],
      isVerified: false,
    },
  ];
  return { guides };
});

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

  it("prefers locale-matching verified guide for trail", () => {
    const deMatch = matchGuideForTrail("artemis", "de");
    expect(deMatch.verifiedGuide?.languages).toContain("german");
  });
});
