"use client";

import { StatusStrip, StatusStripLink } from "@/components/StatusStrip";
import { STRIP } from "@/lib/design-tokens";

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
    <StatusStrip variant="aegean" labelledBy="trail-conditions-heading">
      <StatusStripLink href="/trails" ariaLabel={aria} layout="split">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span id="trail-conditions-heading" className={STRIP.label}>
            {heading}
          </span>
          <span className={`flex items-center gap-2 ${STRIP.meta}`}>
            {openLabel && <span className="text-sage font-medium">{openLabel}</span>}
            {cautionLabel && <span className="text-golden font-medium">{cautionLabel}</span>}
            {closedLabel && <span className="text-terracotta font-medium">{closedLabel}</span>}
            {noReportLabel && <span className="text-olive/60">{noReportLabel}</span>}
          </span>
        </div>
        <span className={STRIP.hint}>{summaryLabel}</span>
      </StatusStripLink>
    </StatusStrip>
  );
}
