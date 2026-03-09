"use client";

import FilterChips from "@/components/FilterChips";
import { TRAIL_REGIONS, TRAIL_DIFFICULTIES } from "@/data/trails";
import { buildTrailHref } from "@/lib/trail-url";
import type { TrailStatus } from "@/data/trails";

export type TrailFiltersProps = {
  statusFilter?: TrailStatus;
  difficultyFilter?: string;
  regionFilter?: string;
  openCount: number;
  cautionCount: number;
  closedCount: number;
};

export default function TrailFilters({
  statusFilter: safeStatus,
  difficultyFilter: safeDifficulty,
  regionFilter: safeRegion,
  openCount,
  cautionCount,
  closedCount,
}: TrailFiltersProps) {
  const statusChips = [
    { id: "", label: "All status" },
    { id: "open", label: `Open (${openCount})` },
    { id: "caution", label: `Caution (${cautionCount})` },
    { id: "closed", label: `Closed (${closedCount})` },
  ];

  const difficultyChips = [
    { id: "", label: "All difficulties" },
    ...TRAIL_DIFFICULTIES.map((d) => ({ id: d, label: d.charAt(0).toUpperCase() + d.slice(1) })),
  ];

  const regionChips = [
    { id: "", label: "All regions" },
    ...TRAIL_REGIONS.map((r) => ({ id: r, label: r })),
  ];

  return (
    <section aria-label="Filter trails" className="space-y-4">
      <div>
        <span className="sr-only">Filter by status</span>
        <FilterChips
          chips={statusChips}
          isActive={(chip) => (chip.id === "" ? !safeStatus : safeStatus === chip.id)}
          getHref={(chip) =>
            buildTrailHref({
              status: chip.id ? (chip.id as TrailStatus) : undefined,
              difficulty: safeDifficulty,
              region: safeRegion,
            })
          }
          ariaLabel="Filter by trail status"
        />
      </div>
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="prose-label text-olive/60 sm:w-auto w-full mb-0.5 sm:mb-0">Difficulty</span>
          <FilterChips
            chips={difficultyChips}
            isActive={(chip) => (chip.id === "" ? !safeDifficulty : safeDifficulty === chip.id)}
            getHref={(chip) =>
              buildTrailHref({
                status: safeStatus,
                difficulty: chip.id || undefined,
                region: safeRegion,
              })
            }
            ariaLabel="Filter by difficulty"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="prose-label text-olive/60 sm:w-auto w-full mb-0.5 sm:mb-0">Region</span>
          <FilterChips
            chips={regionChips}
            isActive={(chip) => (chip.id === "" ? !safeRegion : safeRegion === chip.id)}
            getHref={(chip) =>
              buildTrailHref({
                status: safeStatus,
                difficulty: safeDifficulty,
                region: chip.id || undefined,
              })
            }
            ariaLabel="Filter by region"
          />
        </div>
      </div>
    </section>
  );
}
