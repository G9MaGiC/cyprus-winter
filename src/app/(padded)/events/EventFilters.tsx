"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import FilterChips from "@/components/FilterChips";
import { CARD, TYPE } from "@/lib/design-tokens";

interface EventFiltersProps {
  typeFilter: string;
  regionFilter: string;
  typeChips: { id: string; label: string }[];
  regionChips: { id: string; label: string }[];
  hasInvalidFilter: boolean;
}

export default function EventFilters({
  typeFilter,
  regionFilter,
  typeChips,
  regionChips,
  hasInvalidFilter,
}: EventFiltersProps) {
  const tPage = useTranslations("events.page");

  const hasFilters = Boolean(typeFilter || regionFilter);
  const typeFilterLabel = typeFilter
    ? (typeChips.find((c) => c.id === typeFilter)?.label ?? null)
    : null;

  const [filtersExpanded, setFiltersExpanded] = useState(hasFilters);

  const buildFilterHref = (type: string, region: string) => {
    const q = new URLSearchParams();
    if (type) q.set("type", type);
    if (region) q.set("region", region);
    return q.toString() ? `/events?${q.toString()}` : "/events";
  };

  const filterGroup = (
    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-4 lg:gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`${TYPE.kicker} text-olive/60 w-full sm:w-auto shrink-0`}>{tPage("filters.typeLabel")}</span>
        <FilterChips
          chips={typeChips}
          isActive={(c) => (c.id === "" ? !typeFilter : typeFilter === c.id)}
          getHref={(c) => buildFilterHref(c.id, regionFilter)}
          ariaLabel={tPage("filters.byTypeAria")}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`${TYPE.kicker} text-olive/60 w-full sm:w-auto shrink-0`}>{tPage("filters.regionLabel")}</span>
        <FilterChips
          chips={regionChips}
          isActive={(c) => (c.id === "" ? !regionFilter : regionFilter === c.id)}
          getHref={(c) => buildFilterHref(typeFilter, c.id)}
          ariaLabel={tPage("filters.byRegionAria")}
        />
      </div>
    </div>
  );

  return (
    <section aria-label={tPage("filters.aria")} className="mb-0">
      <div className={`${CARD.base} ${CARD.content}`}>
        {hasInvalidFilter && (
          <p className="text-sm text-olive/70 mb-4" role="status">
            {tPage("filters.unknown")}
          </p>
        )}
        <div className="sm:hidden">
          <button
            type="button"
            onClick={() => setFiltersExpanded((v) => !v)}
            className="flex items-center justify-between w-full min-h-[44px] px-4 py-3 rounded-lg border border-sand-200/80 bg-white/80 text-start font-medium text-olive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-expanded={filtersExpanded}
            aria-controls="event-filters"
            id="event-filters-toggle"
          >
            <span className="text-sm">{tPage("filters.togglePrefix")} {hasFilters ? [typeFilterLabel, regionFilter].filter(Boolean).join(", ") : tPage("filters.toggleAll")}</span>
            <span className="text-olive/60 text-xs" aria-hidden>
              {filtersExpanded ? tPage("filters.toggleHide") : tPage("filters.toggleShow")}
            </span>
          </button>
          <div
            id="event-filters"
            role="region"
            aria-labelledby="event-filters-toggle"
            hidden={!filtersExpanded}
            className="mt-3 flex flex-col gap-4"
          >
            {filterGroup}
          </div>
        </div>
        <div className="hidden sm:block">{filterGroup}</div>
      </div>
    </section>
  );
}
