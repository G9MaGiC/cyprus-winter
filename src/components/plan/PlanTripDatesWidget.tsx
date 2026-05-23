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
  /** Collapse behind summary on empty plan so templates stay above the fold */
  defaultCollapsed?: boolean;
};

function TripDatesFields({
  dates,
  setTripDates,
  withinSevenDays,
}: Pick<PlanTripDatesWidgetProps, "dates" | "setTripDates" | "withinSevenDays">) {
  const t = useTranslations("plan.tripDatesWidget");
  return (
    <>
      <h2 className={`${TYPE.subSectionTitle} text-olive text-base ${SECTION.headingGap}`}>{t("heading")}</h2>
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 mb-5">
        <label className="flex flex-col gap-2">
          <span className={`${TYPE.kicker} text-olive/60`}>{t("startLabel")}</span>
          <input
            type="date"
            value={dates.start ?? ""}
            onChange={(e) => setTripDates(e.target.value || null, dates.end)}
            className="min-h-[44px] w-full px-4 py-2.5 rounded-xl border border-sand-200 bg-white text-charcoal text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className={`${TYPE.kicker} text-olive/60`}>{t("endLabel")}</span>
          <input
            type="date"
            value={dates.end ?? ""}
            onChange={(e) => setTripDates(dates.start, e.target.value || null)}
            className="min-h-[44px] w-full px-4 py-2.5 rounded-xl border border-sand-200 bg-white text-charcoal text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
        </label>
      </div>
      {dates.start && (
        <PushOptIn tripStartDate={dates.start} variant={withinSevenDays ? "soon" : "far"} />
      )}
    </>
  );
}

export default function PlanTripDatesWidget({
  dates,
  setTripDates,
  withinSevenDays,
  defaultCollapsed = false,
}: PlanTripDatesWidgetProps) {
  const t = useTranslations("plan.tripDatesWidget");
  const cardClass = "rounded-2xl border border-sand-200/90 bg-white/90 p-6 sm:p-7 shadow-sm";

  if (defaultCollapsed) {
    return (
      <ListPageWidgetStrip ariaLabel={t("ariaLabel")}>
        <details className={`group ${cardClass}`}>
          <summary className="list-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl min-h-[48px] flex flex-col justify-center [&::-webkit-details-marker]:hidden">
            <span className={`${TYPE.subSectionTitle} text-olive text-base`}>{t("optionalSummary")}</span>
            <span className="text-sm text-olive/60 mt-1">{t("optionalHint")}</span>
          </summary>
          <div className="mt-5 pt-5 border-t border-sand-200/80">
            <TripDatesFields dates={dates} setTripDates={setTripDates} withinSevenDays={withinSevenDays} />
          </div>
        </details>
      </ListPageWidgetStrip>
    );
  }

  return (
    <ListPageWidgetStrip ariaLabel={t("ariaLabel")}>
      <div className={cardClass}>
        <TripDatesFields dates={dates} setTripDates={setTripDates} withinSevenDays={withinSevenDays} />
      </div>
    </ListPageWidgetStrip>
  );
}
