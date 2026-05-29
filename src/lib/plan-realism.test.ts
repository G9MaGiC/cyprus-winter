import { describe, it, expect } from "vitest";
import { analyzePlanDay, coarseZone } from "./plan-realism";
import type { PlanItem } from "@/data";

function place(id: string, region: string, type: PlanItem["type"] = "attraction"): PlanItem {
  return { id, name: id, region, type };
}

describe("coarseZone", () => {
  it("maps Troodos regions", () => {
    expect(coarseZone("Platres (Troodos)")).toBe("troodos");
  });
  it("maps Paphos", () => {
    expect(coarseZone("Paphos")).toBe("paphos");
  });
});

describe("analyzePlanDay", () => {
  it("returns empty for no places", () => {
    expect(analyzePlanDay([])).toEqual([]);
  });

  it("warns on spread regions", () => {
    const w = analyzePlanDay([
      place("a", "Kykkos (Troodos)"),
      place("b", "Paphos"),
      place("c", "Ayia Napa"),
    ]);
    expect(w.some((x) => x.id === "spreadRegions")).toBe(true);
  });

  it("warns on tight day", () => {
    const w = analyzePlanDay([
      place("a", "Omodos"),
      place("b", "Omodos"),
      place("c", "Omodos"),
      place("d", "Omodos"),
    ]);
    expect(w.some((x) => x.id === "tightDay")).toBe(true);
  });
});
