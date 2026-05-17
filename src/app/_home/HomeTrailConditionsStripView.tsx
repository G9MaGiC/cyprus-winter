"use client";

import AppLink from "@/components/AppLink";
import { LAYOUT, STRIP, TYPE } from "@/lib/design-tokens";

export type HomeTrailConditionsStripViewProps = {
  aria: string;
  heading: string;
  openLabel: string | null;
  cautionLabel: string | null;
  closedLabel: string | null;
  noReportLabel: string | null;
  summaryLabel: string;
};

export default function HomeTrailConditionsStripView({
  aria,
  heading,
  openLabel,
  cautionLabel,
  closedLabel,
  noReportLabel,
  summaryLabel,
}: HomeTrailConditionsStripViewProps) {
  return (
    <section
      aria-labelledby="trail-conditions-heading"
      className={`${LAYOUT.safeAreaX} ${STRIP.py} bg-aegean/5 border-b border-sand-200/70`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <AppLink
          href="/trails"
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-h-[44px] py-2 group"
          aria-label={aria}
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span id="trail-conditions-heading" className={`${TYPE.cardTitle}`}>
              {heading}
            </span>
            <span className="flex items-center gap-2 text-sm text-olive/80">
              {openLabel && <span className="text-sage font-medium">{openLabel}</span>}
              {cautionLabel && <span className="text-golden font-medium">{cautionLabel}</span>}
              {closedLabel && <span className="text-terracotta font-medium">{closedLabel}</span>}
              {noReportLabel && <span className="text-olive/60">{noReportLabel}</span>}
            </span>
          </div>
          <span className="text-sage text-sm group-hover:text-terracotta transition-colors shrink-0">
            {summaryLabel}
          </span>
        </AppLink>
      </div>
    </section>
  );
}
