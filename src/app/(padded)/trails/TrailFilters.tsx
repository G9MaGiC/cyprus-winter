"use client";

import FilterChips from "@/components/FilterChips";
import { TRAIL_REGIONS, TRAIL_DIFFICULTIES } from "@/data/trails";
import { TRANSITION } from "@/lib/design-tokens";

export type TrailFiltersProps = {
  difficultyFilter?: string;
  regionFilter?: string;
  filtersExpanded: boolean;
  onToggleExpand: (open?: boolean) => void;
  filterSummary: string;
  /** When true, on mobile filters are in a collapsible details. */
  alwaysVisible?: boolean;
};

function buildTrailHref(
  chipId: string,
  param: "difficulty" | "region",
  safeDifficulty?: string,
  safeRegion?: string
): string {
  const q = new URLSearchParams();
  if (param === "difficulty") {
    if (chipId) q.set("difficulty", chipId);
    if (safeRegion) q.set("region", safeRegion);
  } else {
    if (safeDifficulty) q.set("difficulty", safeDifficulty);
    if (chipId) q.set("region", chipId);
  }
  return q.toString() ? `/trails?${q.toString()}` : "/trails";
}

export default function TrailFilters({
  difficultyFilter: safeDifficulty,
  regionFilter: safeRegion,
  filtersExpanded,
  onToggleExpand,
  filterSummary,
  alwaysVisible = false,
}: TrailFiltersProps) {
  const difficultyChips = [
    { id: "", label: "All difficulties" },
    ...TRAIL_DIFFICULTIES.map((d) => ({ id: d, label: d.charAt(0).toUpperCase() + d.slice(1) })),
  ];
  const regionChips = [{ id: "", label: "All regions" }, ...TRAIL_REGIONS.map((r) => ({ id: r, label: r }))];

  const filterGroup = (
    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="prose-label text-olive/60 sm:w-auto w-full mb-0.5 sm:mb-0">Difficulty</span>
        <FilterChips
          chips={difficultyChips}
          isActive={(chip) => (chip.id === "" ? !safeDifficulty : safeDifficulty === chip.id)}
          getHref={(chip) => buildTrailHref(chip.id, "difficulty", safeDifficulty, safeRegion)}
          ariaLabel="Filter by difficulty"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="prose-label text-olive/60 sm:w-auto w-full mb-0.5 sm:mb-0">Region</span>
        <FilterChips
          chips={regionChips}
          isActive={(chip) => (chip.id === "" ? !safeRegion : safeRegion === chip.id)}
          getHref={(chip) => buildTrailHref(chip.id, "region", safeDifficulty, safeRegion)}
          ariaLabel="Filter by region"
        />
      </div>
    </div>
  );

  return (
    <section aria-label="Filter trails" className={alwaysVisible ? "" : "mb-6 sm:mb-8"}>
      {alwaysVisible ? (
        <>
          <div className="sm:hidden">
            <details
              className="group"
              open={filtersExpanded}
              onToggle={(e) => onToggleExpand(e.currentTarget.open)}
            >
              <summary className="list-none cursor-pointer min-h-[44px] flex items-center justify-between px-4 py-3 rounded-lg border border-sand-200/80 bg-white/80 text-left font-medium text-olive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden [&::marker]:hidden">
                <span className="text-sm">Filters: {filterSummary}</span>
                <span className="text-olive/60 text-xs group-open:rotate-180" style={{ transition: `transform ${TRANSITION.smooth}` }} aria-hidden>
                  ▾
                </span>
              </summary>
              <div id="trail-filters" className="mt-3 flex flex-col gap-4" role="region">
                {filterGroup}
              </div>
            </details>
          </div>
          <div className="hidden sm:block">{filterGroup}</div>
        </>
      ) : (
        <>
          <div className="sm:hidden">
            <button
              type="button"
              onClick={() => onToggleExpand()}
              className="flex items-center justify-between w-full min-h-[44px] px-4 py-3 rounded-lg border border-sand-200/80 bg-white/80 text-left font-medium text-olive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
              aria-expanded={filtersExpanded}
              aria-controls="trail-filters"
              id="trail-filters-toggle"
            >
              <span className="text-sm">Filters: {filterSummary}</span>
              <span className="text-olive/60 text-xs" aria-hidden>
                {filtersExpanded ? "Hide" : "Show"}
              </span>
            </button>
            <div
              id="trail-filters"
              role="region"
              aria-labelledby="trail-filters-toggle"
              hidden={!filtersExpanded}
              className="mt-3 flex flex-col gap-4"
            >
              {filterGroup}
            </div>
          </div>
          <div className="hidden sm:flex sm:flex-wrap sm:items-center sm:gap-4">{filterGroup}</div>
        </>
      )}
    </section>
  );
}
