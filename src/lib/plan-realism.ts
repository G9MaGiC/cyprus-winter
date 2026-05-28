/**
 * Heuristic plan-day warnings (drive spread, pace, winter daylight).
 * MVP for persona QA P1-01 / P1-02 — not routing API.
 */
import type { PlanItem } from "@/data";

export type PlanDayWarningId =
  | "spreadRegions"
  | "tightDay"
  | "daylight"
  | "trailAndSpread";

export type PlanDayWarning = {
  id: PlanDayWarningId;
};

/** Coarse island zones for same-day drive realism. */
export function coarseZone(region: string): string {
  const r = region.toLowerCase();
  if (
    r.includes("troodos") ||
    r.includes("platres") ||
    r.includes("kykkos") ||
    r.includes("pitsilia") ||
    r.includes("pedoulas") ||
    r.includes("kakopetria") ||
    r.includes("machairas") ||
    r.includes("prodromos")
  ) {
    return "troodos";
  }
  if (r.includes("paphos") || r.includes("pafos") || r.includes("polis")) {
    return "paphos";
  }
  if (r.includes("limassol") || r.includes("lemesos") || r.includes("pelendri")) {
    return "limassol";
  }
  if (r.includes("larnaca") || r.includes("lefkara") && !r.includes("troodos")) {
    return "larnaca";
  }
  if (r.includes("nicosia") || r.includes("lefkosia")) {
    return "nicosia";
  }
  if (
    r.includes("ayia napa") ||
    r.includes("protaras") ||
    r.includes("famagusta") ||
    r.includes("cape greco")
  ) {
    return "east";
  }
  return "other";
}

export function analyzePlanDay(places: PlanItem[]): PlanDayWarning[] {
  if (places.length === 0) return [];

  const warnings: PlanDayWarning[] = [];
  const zones = new Set(places.map((p) => coarseZone(p.region)));
  const hasTrail = places.some((p) => p.type === "trail");
  const distinctZones = [...zones].filter((z) => z !== "other");

  if (distinctZones.length >= 3) {
    warnings.push({ id: "spreadRegions" });
  } else if (distinctZones.length === 2 && places.length >= 2) {
    const hasTroodos = zones.has("troodos");
    const hasCoast =
      zones.has("paphos") || zones.has("limassol") || zones.has("east") || zones.has("larnaca");
    if (hasTroodos && hasCoast) {
      warnings.push({ id: "spreadRegions" });
    }
  }

  if (places.length >= 4) {
    warnings.push({ id: "tightDay" });
  }

  if (hasTrail || places.length >= 2) {
    warnings.push({ id: "daylight" });
  }

  if (hasTrail && distinctZones.length >= 2) {
    warnings.push({ id: "trailAndSpread" });
  }

  const seen = new Set<PlanDayWarningId>();
  return warnings.filter((w) => {
    if (seen.has(w.id)) return false;
    seen.add(w.id);
    return true;
  });
}
