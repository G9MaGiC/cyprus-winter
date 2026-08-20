import { describe, expect, it } from "vitest";
import {
  countPlanGeography,
  planGeographyBucket,
  planGeographyRows,
} from "./plan-geography";

describe("planGeographyBucket", () => {
  it("maps beaches to beach_coast", () => {
    expect(planGeographyBucket("nissi-beach")).toBe("beach_coast");
    expect(planGeographyBucket("fig-tree-bay")).toBe("beach_coast");
  });

  it("maps coastal trails and cycling to beach_coast", () => {
    expect(planGeographyBucket("cape-greco")).toBe("beach_coast");
    expect(planGeographyBucket("aphrodite")).toBe("beach_coast");
    expect(planGeographyBucket("limassol-coastal-cycle")).toBe("beach_coast");
  });

  it("maps wineries, villages, and Troodos trails to rural_mountain", () => {
    expect(planGeographyBucket("tsiakkas")).toBe("rural_mountain");
    expect(planGeographyBucket("omodos")).toBe("rural_mountain");
    expect(planGeographyBucket("artemis")).toBe("rural_mountain");
    expect(planGeographyBucket("troodos-cycling-hub")).toBe("rural_mountain");
  });

  it("maps ancient sites and unknown ids honestly", () => {
    expect(planGeographyBucket("kourion")).toBe("other");
    expect(planGeographyBucket("not-a-real-place")).toBe("unknown");
    expect(planGeographyBucket(undefined)).toBe("unknown");
  });
});

describe("countPlanGeography", () => {
  it("counts rural vs beach vs other vs unknown", () => {
    const counts = countPlanGeography([
      "tsiakkas",
      "nissi-beach",
      "kourion",
      "missing",
      "artemis",
    ]);
    expect(counts.rural_mountain).toBe(2);
    expect(counts.beach_coast).toBe(1);
    expect(counts.other).toBe(1);
    expect(counts.unknown).toBe(1);
    expect(planGeographyRows(counts).map((row) => row.bucket)).toEqual([
      "rural_mountain",
      "beach_coast",
      "other",
      "unknown",
    ]);
  });
});
