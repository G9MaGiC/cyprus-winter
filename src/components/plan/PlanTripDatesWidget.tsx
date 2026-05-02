"use client";

import ListPageWidgetStrip from "@/components/ListPageWidgetStrip";
import PushOptIn from "@/components/PushOptIn";
import type { TripDates } from "@/hooks/useTripDates";

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
  const hasInvalidRange = Boolean(dates.start && dates.end && dates.end < dates.start);

  return (
    <ListPageWidgetStrip ariaLabel="Trip dates">
      <div className="rounded-2xl border border-sand-200/90 bg-white/90 p-6 sm:p-7 shadow-sm">
        <h2 className="text-base font-semibold text-olive mb-4">When are you traveling?</h2>
        <p className="text-sm text-olive/70 mb-4">
          Dates help match the right templates and timing tips for your plan.
        </p>
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 mb-5">
          <label className="flex flex-col gap-2">
            <span className="prose-label text-olive/60">Start</span>
            <input
              type="date"
              value={dates.start ?? ""}
              onChange={(e) => setTripDates(e.target.value || null, dates.end)}
              max={dates.end ?? undefined}
              className="min-h-[44px] w-full px-4 py-2.5 rounded-xl border border-sand-200 bg-white text-charcoal text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="prose-label text-olive/60">End</span>
            <input
              type="date"
              value={dates.end ?? ""}
              onChange={(e) => setTripDates(dates.start, e.target.value || null)}
              min={dates.start ?? undefined}
              className="min-h-[44px] w-full px-4 py-2.5 rounded-xl border border-sand-200 bg-white text-charcoal text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
          </label>
        </div>
        {hasInvalidRange && (
          <p className="text-sm text-terracotta mb-4" role="alert">
            End date must be on or after start date.
          </p>
        )}
        {dates.start && (
          <PushOptIn tripStartDate={dates.start} variant={withinSevenDays ? "soon" : "far"} />
        )}
      </div>
    </ListPageWidgetStrip>
  );
}
