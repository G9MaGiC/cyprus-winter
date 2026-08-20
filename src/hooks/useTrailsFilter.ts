"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { trails, trailConditions, TRAIL_REGIONS, TRAIL_DIFFICULTIES } from "@/data/trails";
import { PROMOTED_TRAIL_IDS } from "@/data/promoted";
import type { Trail, TrailStatus } from "@/data/trails";

const STATUS_IDS: Array<TrailStatus | ""> = ["", "open", "caution", "closed"];

export type UseTrailsFilterReturn = {
  filtered: Trail[];
  openTrails: Trail[];
  cautionTrails: Trail[];
  closedTrails: Trail[];
  unknownTrails: Trail[];
  bestNow: Trail[];
  counts: { open: number; caution: number; closed: number };
  safeDifficulty: string | undefined;
  safeRegion: string | undefined;
  safeStatus: TrailStatus | undefined;
  hasFilters: boolean;
  hasInvalidFilter: boolean;
};

export function useTrailsFilter(): UseTrailsFilterReturn {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const difficultyFilter = searchParams.get("difficulty") ?? undefined;
    const regionFilter = searchParams.get("region") ?? undefined;
    const statusFilter = (searchParams.get("status") ?? undefined) as TrailStatus | undefined;

    const validDifficulty =
      !difficultyFilter || TRAIL_DIFFICULTIES.includes(difficultyFilter as (typeof TRAIL_DIFFICULTIES)[number]);
    const validRegion =
      !regionFilter || TRAIL_REGIONS.includes(regionFilter as (typeof TRAIL_REGIONS)[number]);
    const validStatus = !statusFilter || STATUS_IDS.includes(statusFilter);

    const safeDifficulty = validDifficulty ? difficultyFilter : undefined;
    const safeRegion = validRegion ? regionFilter : undefined;
    const safeStatus = validStatus ? statusFilter : undefined;

    const matchesDifficultyAndRegion = (t: Trail) => {
      if (safeDifficulty && t.difficulty !== safeDifficulty) return false;
      if (safeRegion && t.region !== safeRegion) return false;
      return true;
    };

    const baseFiltered = trails.filter(matchesDifficultyAndRegion);

    const openCount = baseFiltered.filter((t) => trailConditions[t.id]?.status === "open").length;
    const cautionCount = baseFiltered.filter((t) => trailConditions[t.id]?.status === "caution").length;
    const closedCount = baseFiltered.filter((t) => trailConditions[t.id]?.status === "closed").length;

    const filtered = baseFiltered.filter((t) => {
      if (!safeStatus) return true;
      return trailConditions[t.id]?.status === safeStatus;
    });

    const openTrails = filtered.filter((t) => trailConditions[t.id]?.status === "open");
    const cautionTrails = filtered.filter((t) => trailConditions[t.id]?.status === "caution");
    const closedTrails = filtered.filter((t) => trailConditions[t.id]?.status === "closed");
    const unknownTrails = filtered.filter((t) => !trailConditions[t.id]?.status);

    const promotedSet = new Set(PROMOTED_TRAIL_IDS);
    const bestNow = filtered
      .filter((t) => {
        const c = trailConditions[t.id];
        return (
          c?.status === "open" &&
          (c.surface === "dry" || !c.surface) &&
          (c.temperatureC == null || c.temperatureC >= 10)
        );
      })
      .map((t) => {
        const c = trailConditions[t.id];
        const temp = c?.temperatureC ?? 15;
        const tempScore = temp >= 12 && temp <= 18 ? 2 : temp >= 10 && temp <= 22 ? 1 : 0;
        const recency = c?.lastReportedAt
          ? new Date(c.lastReportedAt).getTime()
          : 0;
        const promoted = promotedSet.has(t.id) ? 2 : 0;
        const winterFit = t.bestSeason?.includes("winter") ? 1 : 0;
        const score = tempScore * 10 + promoted * 5 + winterFit + recency / 1e10;
        return { trail: t, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((x) => x.trail);

    const hasFilters = Boolean(safeDifficulty || safeRegion || safeStatus);
    const hasInvalidFilter = Boolean(
      (difficultyFilter && !validDifficulty) ||
        (regionFilter && !validRegion) ||
        (statusFilter && !validStatus)
    );

    return {
      filtered,
      openTrails,
      cautionTrails,
      closedTrails,
      unknownTrails,
      bestNow,
      counts: { open: openCount, caution: cautionCount, closed: closedCount },
      safeDifficulty,
      safeRegion,
      safeStatus,
      hasFilters,
      hasInvalidFilter,
    };
  }, [searchParams]);
}
