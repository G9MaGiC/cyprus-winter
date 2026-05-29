import { describe, expect, it } from "vitest";
import { wineries } from "@/data/wineries";
import { WINERY_OFF_SEASON_HOURS } from "@/data/wineries";

/** B2B-02: winter hours / open flags should be explicit for partner-facing wineries. */
describe("winery winter hours audit", () => {
  it("every winery has winterOpen defined", () => {
    const missing = wineries.filter((w) => w.winterOpen === undefined);
    expect(missing.map((w) => w.id)).toEqual([]);
  });

  it("off-season hours disclaimer is non-empty", () => {
    expect(WINERY_OFF_SEASON_HOURS.length).toBeGreaterThan(10);
  });

  it("verified partners with partnerEmail have contactPhone or bookingUrl", () => {
    const verified = wineries.filter((w) => w.isVerified && w.partnerEmail?.trim());
    const gaps = verified.filter((w) => !w.contactPhone && !w.bookingUrl);
    expect(gaps.map((w) => w.id)).toEqual([]);
  });
});
