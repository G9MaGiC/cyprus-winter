"use client";

import { LAYOUT } from "@/lib/design-tokens";
import type { PlanItem } from "@/data";

type DaySelectorProps = {
  days: Record<number, string[]>;
  activeDay: number;
  setActiveDay: (day: number) => void;
  activeDaysCount: number;
  displayDaysCount: number;
  getPlace: (id: string) => PlanItem | undefined;
  hasContent: boolean;
};

export default function DaySelector({
  days,
  activeDay,
  setActiveDay,
  activeDaysCount,
  displayDaysCount,
  getPlace,
  hasContent,
}: DaySelectorProps) {
  return (
    <section
      aria-label="Select day"
      className={`${
        hasContent
          ? [
              "sticky z-10",
              LAYOUT.stickyTop,
              LAYOUT.stickyBarX,
              "pt-3 pb-3 sm:pt-4 sm:pb-4 mb-6 sm:mb-8 bg-sand/95 backdrop-blur-md supports-[backdrop-filter]:bg-sand/95 border-b border-sand-200/80 shadow-[0_1px_0_0_rgba(234,230,223,0.5)]",
            ].join(" ")
          : "mb-4 sm:mb-6"
      }`}
    >
      <div
        role="tablist"
        aria-label="Select day"
        className="flex gap-1.5 sm:gap-2 overflow-x-auto scroll-smooth scroll-touch pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 snap-x snap-mandatory snap-center scrollbar-none [scrollbar-width:none] [-webkit-overflow-scrolling:touch]"
        onKeyDown={(e) => {
          const t = e.target as HTMLElement;
          if (t.getAttribute("role") !== "tab") return;
          const next =
            e.key === "ArrowLeft" || e.key === "ArrowUp"
              ? activeDay <= 1
                ? displayDaysCount
                : activeDay - 1
              : e.key === "ArrowRight" || e.key === "ArrowDown"
                ? activeDay >= displayDaysCount
                  ? 1
                  : activeDay + 1
                : null;
          if (next != null) {
            e.preventDefault();
            setActiveDay(next);
            (e.currentTarget.querySelector(`[data-day="${next}"]`) as HTMLElement)?.focus();
          }
        }}
      >
        {Array.from({ length: displayDaysCount }, (_, i) => i + 1).map((d) => {
          const count = (days[d] ?? []).length;
          const isActive = activeDay === d;
          return (
            <button
              key={d}
              type="button"
              data-day={d}
              role="tab"
              aria-selected={isActive}
              aria-controls="day-panel"
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveDay(d)}
              className={`shrink-0 snap-center min-w-[3.25rem] min-[400px]:min-w-[3.5rem] sm:min-w-[4.5rem] px-2.5 min-[360px]:px-3 sm:px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 min-h-[44px] active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background whitespace-nowrap ${
                isActive
                  ? "bg-terracotta text-white shadow-sm border border-terracotta/80"
                  : "bg-white/90 border border-sand-200/80 text-olive/80 hover:border-terracotta/25 hover:bg-sand-100/60"
              }`}
            >
              {count > 0 ? `Day ${d} · ${count}` : `Day ${d}`}
            </button>
          );
        })}
      </div>

      {hasContent && (
        <details className="group mt-3 sm:mt-4 hidden sm:block">
          <summary className="list-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-olive/80 hover:text-olive min-h-[44px] py-2.5 rounded-lg transition-colors duration-200 [&::-webkit-details-marker]:hidden">
              {activeDaysCount > 1 ? `View all ${activeDaysCount} days` : "View all days"}
              <span className="text-olive/50 group-open:rotate-180 transition-transform" aria-hidden>
                ▾
              </span>
            </span>
          </summary>
          <div className="mt-3 space-y-2">
            {Array.from({ length: displayDaysCount }, (_, i) => i + 1).map((d) => {
              const items = days[d] ?? [];
              const summary = items.map((id) => getPlace(id)?.name ?? "…").join(" → ") || "Add places to start";
              const isActive = activeDay === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setActiveDay(d)}
                  className={`w-full min-h-[44px] text-left px-4 py-3 rounded-lg text-sm transition-colors flex items-center gap-2 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    isActive ? "bg-terracotta/10 text-terracotta font-medium" : "bg-sand-100/60 text-olive/80 hover:bg-sand-200/60"
                  }`}
                >
                  <span className="font-medium shrink-0">Day {d}</span>
                  <span className="truncate text-olive/70">{summary}</span>
                </button>
              );
            })}
          </div>
        </details>
      )}
    </section>
  );
}
