import { describe, expect, it } from "vitest";
import { wineries } from "@/data/wineries";
import { allAttractions } from "@/data";
import { restaurants } from "@/data/restaurants";
import { LOCALIZED_WINERY_IDS } from "@/lib/winery-content-ids";
import { LOCALIZED_ATTRACTION_IDS } from "@/lib/attraction-content-ids";
import { LOCALIZED_RESTAURANT_IDS } from "@/lib/restaurant-content-ids";

/**
 * The discover dispatcher (discover-content.ts) routes by id membership and
 * casts to the matching record type — sound only while the three registries
 * stay pairwise disjoint and each id resolves to a record of the type its
 * overlay expects. The dispatcher's doc comment asserts this; here it is
 * pinned (arc review, batch 65).
 */

const SETS: Array<[string, ReadonlySet<string>, Set<string>]> = [
  ["wineries", LOCALIZED_WINERY_IDS, new Set(wineries.map((w) => w.id))],
  ["attractions", LOCALIZED_ATTRACTION_IDS, new Set(allAttractions.map((a) => a.id))],
  ["restaurants", LOCALIZED_RESTAURANT_IDS, new Set(restaurants.map((r) => r.id))],
];

describe("discover dispatcher id registries", () => {
  it("the three registries are pairwise disjoint", () => {
    for (let i = 0; i < SETS.length; i++) {
      for (let j = i + 1; j < SETS.length; j++) {
        const overlap = [...SETS[i][1]].filter((id) => SETS[j][1].has(id));
        expect(
          overlap,
          `${SETS[i][0]} ∩ ${SETS[j][0]} must be empty`
        ).toEqual([]);
      }
    }
  });

  it("every registry id resolves to a record of its own pool", () => {
    for (const [name, registry, pool] of SETS) {
      for (const id of registry) {
        expect(pool.has(id), `${name}: ${id} missing from its data pool`).toBe(true);
      }
    }
  });
});
