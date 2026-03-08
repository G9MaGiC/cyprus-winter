"use client";

import { type RefObject } from "react";
import Link from "next/link";
import TimelineRow from "@/components/plan/TimelineRow";
import SuggestedForDay from "@/components/SuggestedForDay";
import SectionCard from "@/components/SectionCard";
import { CARD, CTA, EMPTY_STATE_DASHED, PILL, TYPE } from "@/lib/design-tokens";
import type { PlanItem } from "@/data";
import { PLAN_QUICK_ADD_PLACES } from "@/data/plan-quick-add";

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
  const activeDayItems = activeItems;

  return (
    <section aria-label="Your itinerary" className="space-y-5 sm:space-y-8 scroll-mt-24 sm:scroll-mt-28">
      <div id="day-panel" role="tabpanel" aria-live="polite" aria-atomic="false" className="space-y-5 sm:space-y-8">
        <div className={`rounded-2xl ${CARD.base} overflow-hidden ${CARD.hover} transition-shadow duration-200`}>
          <div className={`${CARD.content} border-b border-sand-200/80 bg-sand-100/50 space-y-1`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-xl sm:text-2xl font-semibold text-olive tracking-tight">
                Day {activeDay}
                {activeItems.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-olive/70">
                    — {activeItems.length} {activeItems.length === 1 ? "place" : "places"}
                  </span>
                )}
              </h3>
              {activeItems.length > 0 && (
                <button
                  type="button"
                  onClick={onClearDay}
                  className="min-h-[44px] inline-flex items-center px-3 py-2 text-sm font-medium text-olive/60 hover:text-terracotta rounded-lg hover:bg-terracotta/5 transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={`Clear all places from Day ${activeDay}`}
                >
                  Clear day
                </button>
              )}
            </div>
            {activeItems.length >= 3 && (
              <p className="text-sm text-olive/70 leading-relaxed" role="status">
                Add another stop below or switch day above.
              </p>
            )}
          </div>

          <div className={CARD.content}>
            {activeItems.length === 0 ? (
              <div className={`${EMPTY_STATE_DASHED} py-14 min-[400px]:py-16 sm:py-24 px-4 min-[360px]:px-6 bg-sand-100/50 transition-colors duration-200`}>
                <p className="font-display text-xl font-semibold text-olive mb-2 tracking-tight">Start Day {activeDay}</p>
                <p className="text-sm text-olive/70 mb-6 leading-relaxed max-w-sm mx-auto">Add your first place — trail, village, or winery.</p>
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                  <button type="button" onClick={onScrollToQuickStart} className={`${CTA.primaryCompact} active:scale-[0.98] motion-reduce:active:scale-100 transition-transform duration-150`}>
                    Add place
                  </button>
                  <Link href="/discover" className={CTA.secondaryCompact}>
                    Browse
                  </Link>
                  <Link href="/trails" className={CTA.secondaryCompact}>
                    Trails
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-0">
                {useBlocks ? (
                  <>
                    <div className="pt-1 mb-3">
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
                        <div className="mt-6 mb-3">
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
        <div id="plan-inline-add">
          <SectionCard title="Add another stop" subtitle={activeItems.length > 0 ? "Quick picks or browse all." : undefined} borderAccent="terracotta">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 sm:flex-wrap sm:overflow-visible sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [-webkit-overflow-scrolling:touch] overscroll-x-contain touch-pan-x min-h-[44px] items-center">
              {PLAN_QUICK_ADD_PLACES.map(({ id, label }) => {
                const inDay = activeDayItems.includes(id);
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
                    {inDay ? "✓ " : ""}
                    {label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={onBrowseAll}
                className={`shrink-0 snap-start rounded-xl ${CTA.secondaryCompact} active:scale-[0.98] motion-reduce:active:scale-100 transition-transform duration-150`}
              >
                Browse all
              </button>
            </div>
            {activeItems.length > 0 && (
              <div className="mt-4 pt-4 border-t border-sand-200/80">
                <SuggestedForDay activeDayItems={activeItems} onAdd={addToDay} embedded />
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </section>
  );
}
