"use client";

import { type RefObject } from "react";
import TimelineRow from "@/components/plan/TimelineRow";
import SuggestedForDay from "@/components/SuggestedForDay";
import { CARD, CTA, EMPTY_STATE_DASHED, PILL, TYPE } from "@/lib/design-tokens";
import type { PlanItem } from "@/data";
import { PLAN_QUICK_ADD_PLACES } from "@/data/plan-quick-add";

function EmptyDayState({
  activeDay,
  onBrowseAll,
  onScrollToQuickStart,
}: {
  activeDay: number;
  onBrowseAll: () => void;
  onScrollToQuickStart: () => void;
}) {
  return (
      <div className={`${EMPTY_STATE_DASHED} py-16 sm:py-24 px-5 sm:px-6 bg-sand-100/30 hover:border-terracotta/20 transition-colors`}>
      <p className="font-display text-xl sm:text-2xl font-semibold text-olive mb-2 tracking-tight">
        Day {activeDay} is empty
      </p>
      <p className="text-sm text-olive/70 mb-6 leading-relaxed max-w-sm mx-auto">
        Add a place to get started, or use a template below to fill this day quickly.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onBrowseAll}
          className={`${CTA.primaryCompact} active:scale-[0.98] motion-reduce:active:scale-100 transition-transform duration-150 hover:border-terracotta/20`}
          aria-label="Browse places to add to your day"
        >
          Browse places
        </button>
        <button
          type="button"
          onClick={onScrollToQuickStart}
          className={`${CTA.secondaryCompact} hover:border-terracotta/20`}
          aria-label="Scroll to templates section"
        >
          Use a template
        </button>
      </div>
    </div>
  );
}

function DayAddSection({
  activeDay,
  activeItems,
  getPlace,
  addToDay,
  onBrowseAll,
}: {
  activeDay: number;
  activeItems: string[];
  getPlace: (id: string) => PlanItem | undefined;
  addToDay: (id: string) => void;
  onBrowseAll: () => void;
}) {
  return (
    <div
      id="plan-inline-add"
      role="region"
      aria-label={`Add a place to Day ${activeDay}`}
      className="rounded-2xl border-2 border-dashed border-sand-200/90 bg-white/80 p-5 sm:p-6 transition-colors hover:border-terracotta/15"
    >
      <p className="text-sm font-medium text-olive/80 mb-4">
        {activeItems.length > 0 ? "Add another place to Day " + activeDay : "Add a place to Day " + activeDay}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 sm:flex-wrap sm:overflow-visible sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [-webkit-overflow-scrolling:touch] overscroll-x-contain touch-pan-x min-h-[44px] items-center">
        {PLAN_QUICK_ADD_PLACES.map(({ id, label }) => {
          const inDay = activeItems.includes(id);
          const place = getPlace(id);
          if (!place) return null;
          return (
            <button
              key={id}
              type="button"
              onClick={() => addToDay(id)}
              disabled={inDay}
              className={`shrink-0 snap-start ${PILL.base} ${inDay ? "bg-sand-200/80 text-olive/50 cursor-default" : PILL.neutral} disabled:active:scale-100`}
              aria-pressed={inDay}
              aria-label={inDay ? `${label} added` : `Add ${label} to Day ${activeDay}`}
            >
              {inDay ? "Added " : ""}{label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onBrowseAll}
          className={`shrink-0 snap-start ${CTA.primaryCompact} active:scale-[0.98] motion-reduce:active:scale-100 transition-transform duration-150`}
          aria-label="Browse places to add to your day"
        >
          Browse places
        </button>
      </div>
      {activeItems.length > 0 && (
        <div className="mt-6 pt-6 border-t border-sand-200/80">
          <SuggestedForDay activeDayItems={activeItems} onAdd={addToDay} embedded />
        </div>
      )}
    </div>
  );
}

type DayContentPanelProps = {
  activeDay: number;
  activeItems: string[];
  getPlace: (id: string) => PlanItem | undefined;
  addToDay: (id: string) => void;
  removeFromDay: (id: string) => void;
  lastAddedId: string | null;
  lastAddedCardRef: RefObject<HTMLDivElement | null>;
  onClearDay: () => void;
  onBrowseAll: () => void;
  onScrollToQuickStart: () => void;
};

export default function DayContentPanel({
  activeDay,
  activeItems,
  getPlace,
  addToDay,
  removeFromDay,
  lastAddedId,
  lastAddedCardRef,
  onClearDay,
  onBrowseAll,
  onScrollToQuickStart,
}: DayContentPanelProps) {
  const useBlocks = activeItems.length >= 3;
  const mid = Math.ceil(activeItems.length / 2);
  const morningIds = useBlocks ? activeItems.slice(0, mid) : activeItems;
  const afternoonIds = useBlocks ? activeItems.slice(mid) : [];

  return (
    <section aria-label="Your plan" className="space-y-6 sm:space-y-10 scroll-mt-24 sm:scroll-mt-28">
      <div id="day-panel" role="tabpanel" aria-live="polite" aria-atomic="false" className="space-y-6 sm:space-y-8">
        <div className={`rounded-2xl ${CARD.base} overflow-hidden ${CARD.hover} shadow-[0_2px_12px_rgba(37,39,48,0.05)]`}>
          <div className={`${CARD.content} border-b border-sand-200/80 bg-sand-100/40`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="inline-flex items-center min-h-[44px] px-3 py-2 rounded-xl bg-terracotta/10 text-terracotta font-semibold text-sm"
                  aria-hidden
                >
                  Day {activeDay}
                </span>
                {activeItems.length > 0 && (
                  <span className="text-sm text-olive/70">
                    {activeItems.length} {activeItems.length === 1 ? "place" : "places"}
                  </span>
                )}
              </div>
              {activeItems.length > 0 && (
                <button
                  type="button"
                  onClick={onClearDay}
                  className="min-h-[44px] inline-flex items-center px-3 py-2 text-sm text-olive/60 hover:text-terracotta hover:underline underline-offset-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={`Clear all places from Day ${activeDay}`}
                >
                  Clear day
                </button>
              )}
            </div>
            {activeItems.length >= 3 && (
              <p className="text-sm text-olive/60 mt-3 leading-relaxed" role="status">
                Add another stop, or switch day above.
              </p>
            )}
          </div>

          <div className={CARD.content}>
            {activeItems.length === 0 ? (
              <EmptyDayState
                activeDay={activeDay}
                onBrowseAll={onBrowseAll}
                onScrollToQuickStart={onScrollToQuickStart}
              />
            ) : (
              <div className="space-y-0">
                {useBlocks ? (
                  <>
                    <div className="pt-1 mb-4 pl-12">
                      <span className={`${TYPE.kicker} text-olive/70`}>Morning</span>
                    </div>
                    <div className="space-y-0">
                      {morningIds.map((itemId, i) => (
                        <TimelineRow
                          key={itemId}
                          id={itemId}
                          index={i + 1}
                          showConnector={i < morningIds.length - 1 || afternoonIds.length > 0}
                          lastAddedId={lastAddedId}
                          lastAddedCardRef={lastAddedCardRef}
                          getPlace={getPlace}
                          removeFromDay={removeFromDay}
                        />
                      ))}
                    </div>
                    {afternoonIds.length > 0 && (
                      <>
                        <div className="mt-8 mb-4 pl-12">
                          <span className={`${TYPE.kicker} text-olive/60`}>Afternoon</span>
                        </div>
                        <div className="space-y-0">
                          {afternoonIds.map((itemId, i) => (
                            <TimelineRow
                              key={itemId}
                              id={itemId}
                              index={mid + i + 1}
                              showConnector={i < afternoonIds.length - 1}
                              lastAddedId={lastAddedId}
                              lastAddedCardRef={lastAddedCardRef}
                              getPlace={getPlace}
                              removeFromDay={removeFromDay}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="space-y-0">
                    {activeItems.map((itemId, i) => (
                      <TimelineRow
                        key={itemId}
                        id={itemId}
                        index={i + 1}
                        showConnector={i < activeItems.length - 1}
                        lastAddedId={lastAddedId}
                        lastAddedCardRef={lastAddedCardRef}
                        getPlace={getPlace}
                        removeFromDay={removeFromDay}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div id="plan-add-sentinel" aria-hidden className="h-0" />
        <DayAddSection
          activeDay={activeDay}
          activeItems={activeItems}
          getPlace={getPlace}
          addToDay={addToDay}
          onBrowseAll={onBrowseAll}
        />
      </div>
    </section>
  );
}
