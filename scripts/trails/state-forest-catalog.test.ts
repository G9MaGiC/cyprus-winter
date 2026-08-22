import { describe, expect, it } from "vitest";
import { AUTHORITATIVE_TRAIL_IDS } from "./authoritative-trail-ids";
import { buildCatalogSnapshot } from "./state-forest-catalog";
import { buildHikingMapValidationReport } from "./vc-hiking-map-validate";

describe("state-forest-catalog intake", () => {
  it("matches committed authoritative trail ids", () => {
    const snapshot = buildCatalogSnapshot();
    expect([...snapshot.authoritativeUnion].sort()).toEqual([...AUTHORITATIVE_TRAIL_IDS]);
  });

  it("has all 68 authoritative ids in app catalog", () => {
    const report = buildHikingMapValidationReport();
    expect(report.authoritativeMissing).toEqual([]);
    expect(report.appTrailCount).toBeGreaterThanOrEqual(68);
  });
});
