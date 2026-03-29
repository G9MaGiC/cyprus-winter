"use client";

import ListPageWidgetStrip from "@/components/ListPageWidgetStrip";
import { SECTION, TYPE } from "@/lib/design-tokens";
import PushOptIn from "@/components/PushOptIn";
import type { TripDates } from "@/hooks/useTripDates";
import { useTranslations } from "next-intl";

type PlanTripDatesWidgetProps = {
  dates: TripDates;
  setTripDates: (start: string | null, end: string | null) => void;
  withinSevenDays: boolean;
};

export default function PlanTripDatesWidget({
  dates,
  setTripDates,
  withinSevenDays,
}: PlanTripDatesWidgetProps) {
  const t = useTranslations("plan.tripDatesWidget");
  return (
    <ListPageWidgetStrip ariaLabel={t("ariaLabel")}>
      <div className="rounded-2xl border border-sand-200/80 bg-white/90 p-7 sm:p-8 shadow-[0_2px_16px_rgba(201,111,82,0.05),0_1px_4px_rgba(37,39,48,0.04)]">
        <h2 className={`${TYPE.subSectionTitle} text-olive text-base ${SECTION.headingGap}`}>{t("heading")}</h2>
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 mb-6">
          <label className="flex flex-col gap-2.5">
            <span className={`${TYPE.kicker} text-olive/60`}>{t("startLabel")}</span>
            <input
              type="date"
              value={dates.start ?? ""}
              onChange={(e) => setTripDates(e.target.value || null, dates.end)}
              className="min-h-[48px] w-full px-4 py-3 rounded-2xl border border-sand-200/70 bg-white text-charcoal text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40 focus-visible:border-terracotta/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors"
            />
          </label>
          <label className="flex flex-col gap-2.5">
            <span className={`${TYPE.kicker} text-olive/60`}>{t("endLabel")}</span>
            <input
              type="date"
              value={dates.end ?? ""}
              onChange={(e) => setTripDates(dates.start, e.target.value || null)}
              className="min-h-[48px] w-full px-4 py-3 rounded-2xl border border-sand-200/70 bg-white text-charcoal text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40 focus-visible:border-terracotta/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors"
            />
          </label>
        </div>
        {dates.start && (
          <PushOptIn tripStartDate={dates.start} variant={withinSevenDays ? "soon" : "far"} />
        )}
      </div>
    </ListPageWidgetStrip>
  );
}
