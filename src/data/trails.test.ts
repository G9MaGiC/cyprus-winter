import { describe, it, expect } from "vitest";
import { trailConditions } from "./trails";

describe("trailConditions", () => {
  it("editorial snapshots do not expose live report timestamps", () => {
    expect(Object.keys(trailConditions).length).toBeGreaterThan(0);

    for (const [trailId, condition] of Object.entries(trailConditions)) {
      expect(
        condition.lastReportedAt,
        `${trailId} should not look like a fresh user report`
      ).toBeUndefined();
    }
  });
});
