"use client";

import FilterChips from "@/components/FilterChips";
import { TRAIL_REGIONS, TRAIL_DIFFICULTIES } from "@/data/trails";
import { TYPE } from "@/lib/design-tokens";
import { buildTrailHref } from "@/lib/trail-url";
import type { TrailStatus } from "@/data/trails";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("trails");

  const statusChips = [
    { id: "", label: t("filters.all.status") },
    { id: "open", label: t("filters.status.open", { count: openCount }) },
    { id: "caution", label: t("filters.status.caution", { count: cautionCount }) },
    { id: "closed", label: t("filters.status.closed", { count: closedCount }) },
  ];

  const difficultyChips = [
    { id: "", label: t("filters.all.difficulties") },
    ...TRAIL_DIFFICULTIES.map((d) => ({ id: d, label: d.charAt(0).toUpperCase() + d.slice(1) })),
  ];

  const regionChips = [
    { id: "", label: t("filters.all.regions") },
    ...TRAIL_REGIONS.map((r) => ({ id: r, label: r })),
  ];

  return (
    <section aria-label={t("filters.aria.section")} className="space-y-4">
      <div>
        <span className="sr-only">{t("filters.sr.status")}</span>
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
          ariaLabel={t("filters.aria.status")}
        />
      </div>
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`${TYPE.kicker} text-olive/60 sm:w-auto w-full mb-0.5 sm:mb-0`}>
            {t("filters.labels.difficulty")}
          </span>
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
            ariaLabel={t("filters.aria.difficulty")}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`${TYPE.kicker} text-olive/60 sm:w-auto w-full mb-0.5 sm:mb-0`}>
            {t("filters.labels.region")}
          </span>
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
            ariaLabel={t("filters.aria.region")}
          />
        </div>
      </div>
    </section>
  );
}
