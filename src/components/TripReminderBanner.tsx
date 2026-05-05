"use client";

import { Link } from "@/i18n/navigation";
import { useTripDates } from "@/hooks/useTripDates";
import { LAYOUT, SECTION, STRIP } from "@/lib/design-tokens";

export default function TripReminderBanner() {
  const { hydrated, daysUntil, withinSevenDays } = useTripDates();

  if (!hydrated || !withinSevenDays || daysUntil === null) return null;

  return (
    <div
      role="status"
      className={`${LAYOUT.safeAreaX} ${STRIP.pyCompact} bg-aegean/10 border-b border-aegean/20`}
    >
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-olive">
          {daysUntil === 0
            ? "Your trip is today — your Day 1 plan is ready."
            : daysUntil === 1
              ? "Tomorrow you are here — your Day 1 plan is ready."
              : `${daysUntil} days until you are here — your Day 1 plan is ready.`}
        </p>
        <Link href="/plan" className={`text-sm ${SECTION.aegeanLink}`}>
          Review plan
        </Link>
      </div>
    </div>
  );
}
