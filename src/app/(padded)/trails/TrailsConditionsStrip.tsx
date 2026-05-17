"use client";

import { StatusStrip, StatusStripLink } from "@/components/StatusStrip";
import { STRIP } from "@/lib/design-tokens";
import { useTranslations, useLocale } from "next-intl";

type TrailsConditionsStripProps = {
  openCount: number;
  cautionCount: number;
  closedCount: number;
};

function getGoNoGoLabel(
  open: number,
  caution: number,
  closed: number,
  t: (key: string, values?: Record<string, unknown>) => string,
  locale: string
): string {
  const formatNumber = new Intl.NumberFormat(locale).format;

  if (open > 0 && closed === 0 && caution === 0) {
    return t("trails.conditionsStrip.goodToGo");
  }

  if (caution > 0 && closed === 0) {
    return t("trails.conditionsStrip.cautionOnly", {
      count: formatNumber(caution),
    });
  }

  if (closed > 0) {
    return t("trails.conditionsStrip.withClosed", {
      count: formatNumber(closed),
    });
  }

  return t("trails.conditionsStrip.checkConditions");
}

export default function TrailsConditionsStrip({
  openCount,
  cautionCount,
  closedCount,
}: TrailsConditionsStripProps) {
  const t = useTranslations();
  const locale = useLocale();
  const label = getGoNoGoLabel(
    openCount,
    cautionCount,
    closedCount,
    (key, values) => t(key as never, values as never) as unknown as string,
    locale
  );

  return (
    <StatusStrip variant="aegean" labelledBy="trails-conditions-heading">
      <StatusStripLink
        href="#trail-list"
        ariaLabel={t("trails.conditionsStrip.ariaViewList")}
        layout="split"
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span id="trails-conditions-heading" className={STRIP.label}>
            {t("trails.conditionsStrip.heading")}
          </span>
          <span className={`flex items-center gap-2 ${STRIP.meta}`}>
            {openCount > 0 && (
              <span className="text-sage font-medium">
                {t("trails.conditionsStrip.openCount", { count: openCount })}
              </span>
            )}
            {cautionCount > 0 && (
              <span className="text-golden font-medium">
                {t("trails.conditionsStrip.cautionCount", {
                  count: cautionCount,
                })}
              </span>
            )}
            {closedCount > 0 && (
              <span className="text-terracotta font-medium">
                {t("trails.conditionsStrip.closedCount", {
                  count: closedCount,
                })}
              </span>
            )}
            {openCount === 0 && cautionCount === 0 && closedCount === 0 && (
              <span className="text-olive/60">{t("trails.conditionsStrip.noReports")}</span>
            )}
          </span>
        </div>
        <span className={STRIP.hint}>{label}</span>
      </StatusStripLink>
    </StatusStrip>
  );
}
