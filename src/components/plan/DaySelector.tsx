"use client";

import { LAYOUT } from "@/lib/design-tokens";
import type { PlanItem } from "@/data";
import { useTranslations } from "next-intl";

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
  const tPlan = useTranslations("plan");
  const t = useTranslations("plan.daySelector");
  return (
    <section
      aria-label={tPlan("aria.selectDay")}
      className={
        hasContent
          ? [
              "sm:sticky z-10",
              LAYOUT.stickyTop,
              LAYOUT.stickyBarX,
              "pt-4 pb-4 sm:pt-5 sm:pb-5 mb-6 sm:mb-8 bg-sand/98 backdrop-blur-md supports-[backdrop-filter]:bg-sand/98 border-b border-sand-200/80",
            ].join(" ")
          : "mb-6 sm:mb-8"
      }
    >
      <div
        role="tablist"
        aria-label={tPlan("aria.selectDay")}
        className="flex gap-2 sm:gap-2.5 overflow-x-auto scroll-smooth scroll-touch pb-2 -mx-1 px-1 sm:mx-0 sm:px-0 snap-x snap-mandatory snap-center scrollbar-none [scrollbar-width:none] [-webkit-overflow-scrolling:touch] overscroll-x-contain touch-pan-x"
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
              className={`shrink-0 snap-center min-w-[3.5rem] min-[400px]:min-w-[3.75rem] sm:min-w-[4.5rem] px-3 sm:px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 min-h-[44px] active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background whitespace-nowrap ${
                isActive
                  ? "bg-terracotta text-white shadow-sm"
                  : "bg-white/90 border border-sand-200/80 text-olive/80 hover:border-terracotta/20 hover:bg-sand-100/60"
              }`}
            >
            {count > 0
              ? t("tabLabelWithCount", { day: d, count })
              : tPlan("dayLabel", { day: d })}
            </button>
          );
        })}
      </div>

      {hasContent && (
        <details className="group mt-4 sm:mt-5 hidden sm:block">
          <summary className="list-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl min-h-[44px] flex items-center">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-olive/70 hover:text-terracotta min-h-[44px] py-2.5 px-3 rounded-xl hover:bg-terracotta/5 transition-colors duration-200 [&::-webkit-details-marker]:hidden">
              {activeDaysCount > 1
                ? t("viewAllDaysCount", { count: activeDaysCount })
                : t("viewAllDays")}
              <span className="text-olive/50 group-open:rotate-180 transition-transform" aria-hidden>
                ▾
              </span>
            </span>
          </summary>
          <div className="mt-3 space-y-2">
            {Array.from({ length: displayDaysCount }, (_, i) => i + 1).map((d) => {
              const items = days[d] ?? [];
              const summary =
                items
                  .map((id) => getPlace(id)?.name ?? t("unknownPlace"))
                  .join(t("summarySeparator")) || t("summaryEmpty");
              const isActive = activeDay === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setActiveDay(d)}
                  className={`w-full min-h-[44px] text-left px-4 py-3 rounded-xl text-sm transition-colors flex items-center gap-2 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    isActive ? "bg-terracotta/10 text-terracotta font-medium" : "bg-sand-100/60 text-olive/80 hover:bg-sand-200/60"
                  }`}
                >
                  <span className="font-medium shrink-0">{tPlan("dayLabel", { day: d })}</span>
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
