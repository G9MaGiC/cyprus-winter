import { afterEach, describe, expect, it } from "vitest";
import { isCallAheadHours, placeCardHours } from "./place-card-hours";
import { resetPartnerOverlaysForTests, setPartnerOverlay } from "./partner-overlay";

describe("placeCardHours", () => {
  afterEach(() => {
    resetPartnerOverlaysForTests();
  });

  it("prefers openingHours on any place type", () => {
    expect(placeCardHours({ openingHours: "Mon–Sat 9:00–16:00" })).toBe("Mon–Sat 9:00–16:00");
  });

  it("prefers partner overlay hours when an id is present", async () => {
    await setPartnerOverlay("tsiakkas", { openingHours: "Winter overlay: Tue–Sat 11:00–15:00." });
    expect(
      placeCardHours({ id: "tsiakkas", openingHours: "Mon–Fri 10:00–16:00, Sat 11:00–17:00. Closed Sun except select dates." })
    ).toBe("Winter overlay: Tue–Sat 11:00–15:00.");
    resetPartnerOverlaysForTests();
  });

  it("uses tastingInfo for wineries when openingHours is missing", () => {
    expect(
      placeCardHours({ type: "winery", tastingInfo: "Fireside tastings; book ahead." })
    ).toBe("Fireside tastings; book ahead.");
  });

  it("returns undefined when neither field is set", () => {
    expect(placeCardHours({ description: "A quiet village." })).toBeUndefined();
  });
});

describe("isCallAheadHours", () => {
  it("detects call-ahead and appointment copy", () => {
    expect(isCallAheadHours("Call ahead Nov–Mar.")).toBe(true);
    expect(isCallAheadHours("By appointment. Road conditions vary.")).toBe(true);
    expect(isCallAheadHours("Mon–Fri 10:00–16:00")).toBe(false);
    expect(isCallAheadHours(undefined)).toBe(false);
  });
});
