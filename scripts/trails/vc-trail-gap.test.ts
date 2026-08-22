import { describe, expect, it } from "vitest";
import { buildVcTrailGapReport } from "./vc-trail-gap";
import { VISITCYPRUS_SLUG_TO_TRAIL_ID } from "./visitcyprus-slug-map";

describe("vc-trail-gap", () => {
  it("flags unmapped VC slugs", () => {
    const report = buildVcTrailGapReport([
      "artemis-circular-lemesos-limassol-district-troodos-forest-nature-trail",
      "brand-new-vc-trail-slug",
    ]);
    expect(report.unmappedVcSlugs).toEqual(["brand-new-vc-trail-slug"]);
    expect(report.invalidTrailIds).toEqual([]);
  });

  it("flags invalid trail ids in slug map", () => {
    const original = VISITCYPRUS_SLUG_TO_TRAIL_ID["artemis-circular-lemesos-limassol-district-troodos-forest-nature-trail"];
    VISITCYPRUS_SLUG_TO_TRAIL_ID["artemis-circular-lemesos-limassol-district-troodos-forest-nature-trail"] =
      "nonexistent-trail-id";
    const report = buildVcTrailGapReport(Object.keys(VISITCYPRUS_SLUG_TO_TRAIL_ID));
    expect(report.invalidTrailIds).toContain("nonexistent-trail-id");
    VISITCYPRUS_SLUG_TO_TRAIL_ID["artemis-circular-lemesos-limassol-district-troodos-forest-nature-trail"] =
      original;
  });

  it("records shared trail ids for madari aliases", () => {
    const report = buildVcTrailGapReport(Object.keys(VISITCYPRUS_SLUG_TO_TRAIL_ID));
    expect(report.sharedTrailIds["madari-ridge"]).toHaveLength(2);
  });
});
