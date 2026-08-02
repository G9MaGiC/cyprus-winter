import { describe, expect, it } from "vitest";
import type { PlanItem } from "@/data";
import { MAX_DAYS } from "./itinerary-share";
import { buildPlanIcs } from "./plan-ics";

const place: PlanItem = {
  id: "day-14-place",
  name: "Day 14 Village",
  region: "Troodos",
  type: "attraction",
};

describe("buildPlanIcs", () => {
  it("exports itinerary events through the supported final day", () => {
    const days = Object.fromEntries(
      Array.from({ length: MAX_DAYS }, (_, index) => [index + 1, [] as string[]])
    ) as Record<number, string[]>;
    days[MAX_DAYS] = [place.id];

    const ics = buildPlanIcs(days, (id) => (id === place.id ? place : undefined), {
      tripStart: new Date(Date.UTC(2026, 0, 1)),
    });

    expect(ics).toContain(`SUMMARY:Cyprus Winter — Day ${MAX_DAYS}`);
    expect(ics).toContain("DESCRIPTION:Day 14 Village (Troodos)");
    expect(ics).toContain("DTSTART;VALUE=DATE:20260114");
    expect(ics).toContain("DTEND;VALUE=DATE:20260115");
  });
});
