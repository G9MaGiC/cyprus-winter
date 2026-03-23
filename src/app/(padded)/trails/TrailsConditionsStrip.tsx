"use client";

import AppLink from "@/components/AppLink";
import { LAYOUT, STRIP, TYPE } from "@/lib/design-tokens";
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
    <section
      aria-labelledby="trails-conditions-heading"
      className={`${LAYOUT.safeAreaX} ${STRIP.py} bg-aegean/5 border-b border-sand-200/70`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <AppLink
          href="#trail-list"
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-h-[44px] py-2 group"
          aria-label={t("trails.conditionsStrip.ariaViewList")}
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span
              id="trails-conditions-heading"
              className={`${TYPE.cardTitle}`}
            >
              {t("trails.conditionsStrip.heading")}
            </span>
            <span className="flex items-center gap-2 text-sm text-olive/80">
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
              {openCount === 0 &&
                cautionCount === 0 &&
                closedCount === 0 && (
                  <span className="text-olive/60">
                    {t("trails.conditionsStrip.noReports")}
                  </span>
                )}
            </span>
          </div>
          <span className="text-sage text-sm group-hover:text-terracotta transition-colors shrink-0">
            {label}
          </span>
        </AppLink>
      </div>
    </section>
  );
}
