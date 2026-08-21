import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { trails } from "@/data/trails";
import { classifyTrailImageSource, getTrailImage } from "./cyprus-images";

const OFFICIAL_TRAIL_IDS = trails
  .filter((t) => classifyTrailImageSource(t.id) === "official")
  .map((t) => t.id);

describe("trail image intake (Visit Cyprus official heroes)", () => {
  it("every trail image resolves to a file on disk", () => {
    for (const trail of trails) {
      const url = getTrailImage(trail.id);
      expect(existsSync(join(process.cwd(), "public", url)), `${trail.id} -> ${url}`).toBe(true);
    }
  });

  it("31 Forestry/Visit Cyprus trails use official per-id photos", () => {
    expect(OFFICIAL_TRAIL_IDS.length).toBe(31);
    for (const id of OFFICIAL_TRAIL_IDS) {
      expect(getTrailImage(id)).toMatch(/^\/images\/cyprus\/trails\/trail-/);
      expect(classifyTrailImageSource(id)).toBe("official");
    }
  });

  it("artemis uses Visit Cyprus hero (not generic Troodos stock)", () => {
    expect(getTrailImage("artemis")).toBe("/images/cyprus/trails/trail-artemis.jpg");
    expect(classifyTrailImageSource("artemis")).toBe("official");
  });

  it("caledonia-falls uses Visit Cyprus waterfall hero", () => {
    expect(getTrailImage("caledonia-falls")).toBe("/images/cyprus/trails/trail-caledonia-falls.jpg");
  });

  it("reports official vs regional vs fallback coverage", () => {
    const counts = { official: 0, regional: 0, fallback: 0 };
    for (const trail of trails) {
      counts[classifyTrailImageSource(trail.id)] += 1;
    }
    expect(counts.official).toBe(31);
    expect(counts.regional).toBeGreaterThan(10);
    expect(trails.length).toBe(73);
  });
});
