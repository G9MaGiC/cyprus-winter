"use client";

import AppLink from "@/components/AppLink";
import TrailFilters from "@/app/(padded)/trails/TrailFilters";
import StickyFilterBar from "@/components/StickyFilterBar";
import { LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";
import type { TrailStatus } from "@/data/trails";
import { useTranslations } from "next-intl";

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
  const tTrails = useTranslations("trails");
  const tCommon = useTranslations("common");

  return (
    <StickyFilterBar ariaLabel={tTrails("filters.aria.section")}>
      <div className={`${LAYOUT.list} mx-auto space-y-4`}>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className={`${TYPE.kicker} text-muted-ink uppercase tracking-wider`}>
            {tTrails("filters.aria.section")}
          </span>
          <span className="text-muted-ink text-sm">
            {tTrails("page.list.filteredHeading", { count: filteredCount })}
          </span>
          {hasFilters && (
            <AppLink href="/trails" className={`text-sm font-medium ${SECTION.aegeanLink} ms-auto sm:ms-2`}>
              {tCommon("clearFilters")}
            </AppLink>
          )}
          {hasInvalidFilter && (
            <span className="text-xs text-muted-ink" role="status">
              {tTrails("filterBar.showingAll")}
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
