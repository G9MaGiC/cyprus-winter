"use client";

import AppLink from "@/components/AppLink";
import { StatusStrip } from "@/components/StatusStrip";
import { useTripDates } from "@/hooks/useTripDates";
import { SECTION, STRIP } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function TripReminderBanner() {
  const { hydrated, daysUntil, withinSevenDays } = useTripDates();
  const tPlan = useTranslations("plan");

  if (!hydrated || !withinSevenDays || daysUntil === null) return null;

  return (
    <StatusStrip variant="aegean" labelledBy="trip-reminder-heading">
      <div
        role="status"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-h-[44px] py-1"
      >
        <p id="trip-reminder-heading" className={STRIP.label}>
          {tPlan("tripReminderBanner", { days: daysUntil })}
        </p>
        <AppLink href="/plan" className={SECTION.aegeanLink}>
          {tPlan("reviewPlan")}
        </AppLink>
      </div>
    </StatusStrip>
  );
}
