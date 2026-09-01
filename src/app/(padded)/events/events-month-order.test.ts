import { describe, expect, it } from "vitest";
import { orderedSeasonMonths } from "./season-months";

/**
 * AUD-59 guard: the events page anchors "now" — in season the current month
 * leads and earlier season months wrap to the end (annual events read as next
 * winter's). The rotation can't be observed live outside Nov–Mar, so pin it.
 */
describe("orderedSeasonMonths", () => {
  it("keeps the planning order out of season", () => {
    expect(orderedSeasonMonths(null)).toEqual(["Nov", "Dec", "Jan", "Feb", "Mar"]);
  });

  it("keeps Nov-first when November is the anchor", () => {
    expect(orderedSeasonMonths("Nov")).toEqual(["Nov", "Dec", "Jan", "Feb", "Mar"]);
  });

  it("rotates so a February visitor sees February first, past months last", () => {
    expect(orderedSeasonMonths("Feb")).toEqual(["Feb", "Mar", "Nov", "Dec", "Jan"]);
  });

  it("rotates the season tail correctly for March", () => {
    expect(orderedSeasonMonths("Mar")).toEqual(["Mar", "Nov", "Dec", "Jan", "Feb"]);
  });
});
