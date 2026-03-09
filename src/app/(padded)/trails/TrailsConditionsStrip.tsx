"use client";

import Link from "next/link";
import { LAYOUT, STRIP } from "@/lib/design-tokens";

type TrailsConditionsStripProps = {
  openCount: number;
  cautionCount: number;
  closedCount: number;
};

function getGoNoGoLabel(open: number, caution: number, closed: number): string {
  if (open > 0 && closed === 0 && caution === 0) return "Good to go";
  if (caution > 0 && closed === 0)
    return `${caution} trail${caution > 1 ? "s" : ""} need${caution === 1 ? "s" : ""} caution`;
  if (closed > 0)
    return `${closed} trail${closed > 1 ? "s" : ""} closed — check before you go`;
  return "Check trail conditions";
}

export default function TrailsConditionsStrip({
  openCount,
  cautionCount,
  closedCount,
}: TrailsConditionsStripProps) {
  const label = getGoNoGoLabel(openCount, cautionCount, closedCount);

  return (
    <section
      aria-labelledby="trails-conditions-heading"
      className={`${LAYOUT.safeAreaX} ${STRIP.py} bg-aegean/5 border-b border-sand-200/70`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <Link
          href="#trail-list"
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-h-[44px] py-2 group"
          aria-label="Trail conditions today — view list"
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span
              id="trails-conditions-heading"
              className="font-display font-semibold text-olive group-hover:text-terracotta transition-colors"
            >
              Conditions today
            </span>
            <span className="flex items-center gap-2 text-sm text-olive/80">
              {openCount > 0 && (
                <span className="text-sage font-medium">{openCount} open</span>
              )}
              {cautionCount > 0 && (
                <span className="text-golden font-medium">
                  {cautionCount} caution
                </span>
              )}
              {closedCount > 0 && (
                <span className="text-terracotta font-medium">
                  {closedCount} closed
                </span>
              )}
              {openCount === 0 &&
                cautionCount === 0 &&
                closedCount === 0 && (
                  <span className="text-olive/60">Check reports</span>
                )}
            </span>
          </div>
          <span className="text-sage text-sm group-hover:text-terracotta transition-colors shrink-0">
            {label}
          </span>
        </Link>
      </div>
    </section>
  );
}
