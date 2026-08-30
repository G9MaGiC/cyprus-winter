import { describe, expect, it } from "vitest";
import { allPlaces } from "@/data";
import { trails } from "@/data/trails";
import { PLAN_ITEMS, TRAIL_SLUG_TO_ID } from "./plan-items.generated";
import { getPlanItemById } from "./plan-items";
import { getPlaceById } from "@/data";

/**
 * plan-items.generated.ts is a checked-in projection so the app shell never
 * value-imports the full catalogs. If this fails, run: npm run data:plan-items
 */
describe("plan-items generated index", () => {
  it("matches the live @/data projection exactly", () => {
    expect(PLAN_ITEMS).toEqual(allPlaces);
  });

  it("carries every trail slug alias", () => {
    const expected = Object.fromEntries(
      trails.filter((t) => t.slug && t.slug !== t.id).map((t) => [t.slug, t.id])
    );
    expect(TRAIL_SLUG_TO_ID).toEqual(expected);
  });

  it("resolves ids and trail slugs identically to @/data getPlaceById", () => {
    for (const p of allPlaces) {
      expect(getPlanItemById(p.id)).toEqual(getPlaceById(p.id));
    }
    for (const t of trails) {
      expect(getPlanItemById(t.slug)).toEqual(getPlaceById(t.slug));
    }
    expect(getPlanItemById("not-a-place")).toBeUndefined();
  });
});
