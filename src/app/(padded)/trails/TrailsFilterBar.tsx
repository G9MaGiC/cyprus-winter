"use client";

import Link from "next/link";
import TrailFilters from "@/app/(padded)/trails/TrailFilters";
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
    <div
      role="region"
      aria-label="Trail filters"
      className={`sticky ${LAYOUT.stickyTop} z-10 bg-background/98 backdrop-blur-md border-b border-sand-200/60 ${LAYOUT.stickyBarX} py-4 sm:py-5`}
    >
      <div className={`${LAYOUT.list} mx-auto space-y-4`}>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="prose-label text-olive/60 uppercase tracking-wider">Filter trails</span>
          <span className="text-olive/60 text-sm">{filteredCount} trails</span>
          {hasFilters && (
            <Link href="/trails" className={`text-sm font-medium ${SECTION.aegeanLink} ml-auto sm:ml-2`}>
              Clear filters
            </Link>
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
    </div>
  );
}
