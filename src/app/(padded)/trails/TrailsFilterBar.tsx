"use client";

import AppLink from "@/components/AppLink";
import TrailFilters from "@/app/(padded)/trails/TrailFilters";
import StickyFilterBar from "@/components/StickyFilterBar";
import { LAYOUT, SECTION } from "@/lib/design-tokens";
import type { TrailStatus } from "@/data/trails";

type TrailsFilterBarProps = {
  filteredCount: number;
  hasFilters: boolean;
  hasInvalidFilter: boolean;
  statusFilter?: TrailStatus;
  difficultyFilter?: string;
  regionFilter?: string;
  openCount: number;
  cautionCount: number;
  closedCount: number;
};

export default function TrailsFilterBar({
  filteredCount,
  hasFilters,
  hasInvalidFilter,
  statusFilter,
  difficultyFilter,
  regionFilter,
  openCount,
  cautionCount,
  closedCount,
}: TrailsFilterBarProps) {
  return (
    <StickyFilterBar ariaLabel="Trail filters">
      <div className={`${LAYOUT.list} mx-auto space-y-4`}>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="prose-label text-olive/60 uppercase tracking-wider">Filter trails</span>
          <span className="text-olive/60 text-sm">{filteredCount} trails</span>
          {hasFilters && (
            <AppLink href="/trails" className={`text-sm font-medium ${SECTION.aegeanLink} ml-auto sm:ml-2`}>
              Clear filters
            </AppLink>
          )}
          {hasInvalidFilter && (
            <span className="text-xs text-olive/60" role="status">
              — Showing all
            </span>
          )}
        </div>
        <TrailFilters
          statusFilter={statusFilter}
          difficultyFilter={difficultyFilter}
          regionFilter={regionFilter}
          openCount={openCount}
          cautionCount={cautionCount}
          closedCount={closedCount}
        />
      </div>
    </StickyFilterBar>
  );
}
