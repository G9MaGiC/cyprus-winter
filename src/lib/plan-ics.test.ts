import { describe, expect, it } from "vitest";
import { buildPlanIcs } from "./plan-ics";
import { MAX_DAYS } from "./itinerary-share";
import type { PlanItem } from "@/data";

function place(id: string): PlanItem {
  return {
    id,
    name: id,
    region: "Troodos",
    type: "attraction",
  };
}

describe("buildPlanIcs", () => {
  it("includes events for days 11–14, not only the first 10", () => {
    const days: Record<number, string[]> = {};
    for (let d = 1; d <= MAX_DAYS; d++) days[d] = [];
    days[11] = ["lefkara"];
    days[14] = ["omodos"];

    const ics = buildPlanIcs(days, (id) => place(id), {
      tripStart: new Date(Date.UTC(2026, 0, 1)),
    });

    expect(ics).toContain("Day 11");
    expect(ics).toContain("lefkara");
    expect(ics).toContain("Day 14");
    expect(ics).toContain("omodos");
  });
});
