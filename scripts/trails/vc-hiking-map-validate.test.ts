import { describe, expect, it } from "vitest";
import {
  AUTHORITATIVE_TRAIL_ID_COUNT,
  AUTHORITATIVE_TRAIL_IDS,
} from "./authoritative-trail-ids";
import { buildHikingMapValidationReport } from "./vc-hiking-map-validate";

describe("authoritative-trail-ids", () => {
  it("has exactly 68 unique sorted ids", () => {
    const sorted = [...AUTHORITATIVE_TRAIL_IDS].sort();
    expect(AUTHORITATIVE_TRAIL_IDS).toEqual(sorted);
    expect(new Set(AUTHORITATIVE_TRAIL_IDS).size).toBe(AUTHORITATIVE_TRAIL_ID_COUNT);
  });
});

describe("vc-hiking-map-validate", () => {
  it("builds a gap report with tier counts", () => {
    const report = buildHikingMapValidationReport();
    expect(report.authoritativeCount).toBe(68);
    expect(report.appTrailCount).toBeGreaterThan(0);
    expect(report.authoritativePresent.length + report.authoritativeMissing.length).toBe(68);
  });

  it("maps VC slug ids into the authoritative union", () => {
    const report = buildHikingMapValidationReport();
    expect(report.vcMappedNotAuthoritative).toEqual([]);
  });
});
