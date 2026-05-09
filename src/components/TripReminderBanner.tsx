"use client";

import AppLink from "@/components/AppLink";
import { useTripDates } from "@/hooks/useTripDates";
import { LAYOUT, SECTION, STRIP } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function TripReminderBanner() {
  const { hydrated, daysUntil, withinSevenDays } = useTripDates();
  const tPlan = useTranslations("plan");

  if (!hydrated || !withinSevenDays || daysUntil === null) return null;

  return (
    <div
      role="status"
      className={`${LAYOUT.safeAreaX} ${STRIP.pyCompact} bg-aegean/10 border-b border-aegean/20`}
    >
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-olive">
          {tPlan("tripReminderBanner", { days: daysUntil })}
        </p>
        <AppLink href="/plan" className={`text-sm ${SECTION.aegeanLink}`}>
          {tPlan("reviewPlan")}
        </AppLink>
      </div>
    </div>
  );
}
