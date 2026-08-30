/**
 * Lean plan-item resolution for the app shell. useItinerary (and through it
 * the sticky plan bar on every page) needs id -> {id, name, region, type} and
 * trail-slug aliasing — never the full catalogs. Value-importing the @/data
 * barrel here would put ~252KB of catalog data in the shared client chunk
 * (see docs/PERF_BASELINE_2026-08.md), so this module only touches the
 * generated projection; the barrel import below is type-only (erased).
 */
import type { PlanItem } from "@/data";
import { PLAN_ITEMS, TRAIL_SLUG_TO_ID } from "@/data/plan-items.generated";

const byId = new Map(PLAN_ITEMS.map((p) => [p.id, p]));

/** Same contract as @/data getPlaceById: id or trail slug -> PlanItem. */
export function getPlanItemById(id: string): PlanItem | undefined {
  return byId.get(id) ?? byId.get(TRAIL_SLUG_TO_ID[id] ?? "");
}

export type { PlanItem };
