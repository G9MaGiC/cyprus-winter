import { describe, expect, it } from "vitest";
import { trails } from "@/data/trails";
import { VISITCYPRUS_SLUG_TO_TRAIL_ID } from "../../scripts/trails/visitcyprus-slug-map";

describe("vc-trail-index audit", () => {
  const trailIds = new Set(trails.map((t) => t.id));

  it("maps every slug to an existing trail id", () => {
    const invalid = Object.entries(VISITCYPRUS_SLUG_TO_TRAIL_ID)
      .filter(([, id]) => !trailIds.has(id))
      .map(([slug, id]) => ({ slug, id }));
    expect(invalid, JSON.stringify(invalid, null, 2)).toEqual([]);
  });

  it("has no empty slug keys or trail ids", () => {
    for (const [slug, id] of Object.entries(VISITCYPRUS_SLUG_TO_TRAIL_ID)) {
      expect(slug.length).toBeGreaterThan(0);
      expect(id.length).toBeGreaterThan(0);
    }
  });

  it("covers the core Troodos flagship trails", () => {
    const mappedIds = new Set(Object.values(VISITCYPRUS_SLUG_TO_TRAIL_ID));
    for (const id of ["artemis", "atalante", "caledonia-falls", "persephone"]) {
      expect(mappedIds.has(id)).toBe(true);
    }
  });
});
