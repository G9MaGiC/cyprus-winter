import { describe, expect, it } from "vitest";
import { isCallAheadHours, placeCardHours } from "./place-card-hours";

describe("placeCardHours", () => {
  it("prefers openingHours on any place type", () => {
    expect(placeCardHours({ openingHours: "Mon–Sat 9:00–16:00" })).toBe("Mon–Sat 9:00–16:00");
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
