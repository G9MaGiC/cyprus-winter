"use client";

import { useCallback, useState, type RefObject } from "react";
import TimelineRow from "@/components/plan/TimelineRow";
import { SRStatus } from "@/components/SRStatus";
import SuggestedForDay from "@/components/SuggestedForDay";
import { CARD, CTA, EMPTY_STATE_DASHED, PILL, SECTION, TYPE } from "@/lib/design-tokens";
import type { PlanItem } from "@/data";
import { PLAN_QUICK_ADD_PLACE_IDS } from "@/data/plan-quick-add";
import PlanDayHints from "@/components/plan/PlanDayHints";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedName } from "@/lib/localize";

function EmptyDayState({
  activeDay,
  onBrowseAll,
  onScrollToQuickStart,
  readOnly,
  planIsEmpty = false,
}: {
  activeDay: number;
  onBrowseAll: () => void;
  onScrollToQuickStart: () => void;
  readOnly?: boolean;
  /** Whole plan has zero places — show the first-run copy instead of the
      generic per-day empty state (plan.addFirstPlace / plan.emptyDay). */
  planIsEmpty?: boolean;
}) {
  const tPlan = useTranslations("plan");
  return (
      <div className={`${EMPTY_STATE_DASHED} py-16 sm:py-24 px-5 sm:px-6 bg-sand-100/30 hover:border-terracotta/20 transition-colors`}>
      <p className={`${TYPE.subSectionTitleLg} text-olive ${SECTION.titleGap}`}>
        {tPlan("dayEmptyTitle", { day: activeDay })}
      </p>
      <p className="text-sm text-muted-ink mb-6 leading-relaxed max-w-sm mx-auto">
        {planIsEmpty ? tPlan("emptyDay") : tPlan("dayEmptyBody")}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onBrowseAll}
          disabled={readOnly}
          className={`${CTA.primaryCompact} active:scale-[0.98] motion-reduce:active:scale-100 transition-transform duration-150 hover:border-terracotta/20 disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label={planIsEmpty ? undefined : tPlan("aria.browsePlacesToAddDay")}
        >
          {planIsEmpty ? tPlan("addFirstPlace") : tPlan("browsePlaces")}
        </button>
        <button
          type="button"
          onClick={onScrollToQuickStart}
          disabled={readOnly}
          className={`${CTA.secondaryCompact} hover:border-terracotta/20 disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label={tPlan("aria.scrollToTemplates")}
        >
          {tPlan("seeTemplates")}
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
  readOnly,
}: {
  activeDay: number;
  activeItems: string[];
  getPlace: (id: string) => PlanItem | undefined;
  addToDay: (id: string) => void;
  onBrowseAll: () => void;
  readOnly?: boolean;
}) {
  const tPlanQuick = useTranslations("planQuick");
  return (
    <div
      id="plan-inline-add"
      role="region"
      aria-label={tPlanQuick("inlineAddAria", { day: activeDay })}
      className="rounded-2xl border-2 border-dashed border-sand-200/90 bg-white/80 p-5 sm:p-6 transition-colors hover:border-terracotta/15"
    >
      <p className={`text-sm font-medium text-muted-ink ${SECTION.headingGap}`}>
        {tPlanQuick("quickAddLabel", { day: activeDay })}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 sm:flex-wrap sm:overflow-visible sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [-webkit-overflow-scrolling:touch] overscroll-x-contain touch-pan-x min-h-[44px] items-center">
        {PLAN_QUICK_ADD_PLACE_IDS.map((id) => {
          const inDay = activeItems.includes(id);
          const place = getPlace(id);
          if (!place) return null;
          const label = tPlanQuick(`quickAddPlaces.${id}` as "quickAddPlaces.artemis");
          return (
            <button
              key={id}
              type="button"
              onClick={() => addToDay(id)}
              disabled={inDay || readOnly}
              className={`shrink-0 snap-start ${PILL.base} ${inDay ? "bg-sand-200/80 text-muted-ink cursor-default" : PILL.neutral} disabled:active:scale-100`}
              aria-pressed={inDay}
              aria-label={
                inDay
                  ? tPlanQuick("quickAddAriaAdded", { label })
                  : tPlanQuick("quickAddAriaAdd", { label, day: activeDay })
              }
            >
              {inDay ? <span aria-hidden>✓ </span> : null}
              {label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onBrowseAll}
          disabled={readOnly}
          className={`shrink-0 snap-start ${CTA.primaryCompact} active:scale-[0.98] motion-reduce:active:scale-100 transition-transform duration-150 disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label={tPlanQuick("browsePlacesAria")}
        >
          {tPlanQuick("browsePlacesCta")}
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
  /** Hide inline quick-add when empty plan already shows chips in Quick Start */
  hideInlineAdd?: boolean;
  readOnly?: boolean;
  planIsEmpty?: boolean;
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
  hideInlineAdd = false,
  readOnly = false,
  planIsEmpty = false,
}: DayContentPanelProps) {
  const tPlan = useTranslations("plan");
  const locale = useLocale();
  // Removals leave aria-live's default aria-relevant ("additions text") silent,
  // and the remove button unmounts under focus — announce them explicitly (BUG-361).
  // The announced name must match the one on the card the user acted on, so
  // it goes through getLocalizedName like the visible plan UI does.
  const [removedMessage, setRemovedMessage] = useState("");
  const announceRemoveFromDay = useCallback(
    (id: string) => {
      const place = getPlace(id);
      const name = place ? getLocalizedName(place, locale) : undefined;
      removeFromDay(id);
      if (name) setRemovedMessage(tPlan("aria.removedFromPlan", { name }));
    },
    [getPlace, locale, removeFromDay, tPlan]
  );
  const useBlocks = activeItems.length >= 3;
  const mid = Math.ceil(activeItems.length / 2);
  const morningIds = useBlocks ? activeItems.slice(0, mid) : activeItems;
  const afternoonIds = useBlocks ? activeItems.slice(mid) : [];
  const lastAddedPlace = lastAddedId ? getPlace(lastAddedId) : undefined;
  const activePlaces = activeItems
    .map((id) => getPlace(id))
    .filter((p): p is PlanItem => p != null);

  return (
    <section aria-label={tPlan("aria.yourItinerary")} className="space-y-6 sm:space-y-10 scroll-mt-24 sm:scroll-mt-28">
      <SRStatus message={removedMessage} />
      <div id="day-panel" role="tabpanel" aria-live="polite" aria-atomic="false" className="space-y-6 sm:space-y-8">
        {lastAddedPlace && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-2xl border border-aegean/20 bg-aegean/10 px-4 py-3 text-sm text-aegean font-medium"
          >
            {tPlan("addedToDayBanner", { name: lastAddedPlace.name, day: activeDay })}
          </div>
        )}
        <div className={`${CARD.base} overflow-hidden ${CARD.hover} shadow-[0_2px_12px_rgba(37,39,48,0.05)]`}>
          <div className={`${CARD.content} border-b border-sand-200/80 bg-sand-100/40`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="inline-flex items-center min-h-[44px] px-3 py-2 rounded-xl bg-terracotta/10 text-terracotta-muted font-semibold text-sm"
                  aria-hidden
                >
                  {tPlan("dayLabel", { day: activeDay })}
                </span>
                {activeItems.length > 0 && (
                  <span className="text-sm text-muted-ink">
                    {tPlan("placesCount", { count: activeItems.length })}
                  </span>
                )}
              </div>
              {activeItems.length > 0 && !readOnly && (
                <button
                  type="button"
                  onClick={onClearDay}
                  className="min-h-[44px] inline-flex items-center px-3 py-2 text-sm text-muted-ink hover:text-terracotta hover:underline underline-offset-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={tPlan("aria.clearDay", { day: activeDay })}
                >
                  {tPlan("clearDay")}
                </button>
              )}
            </div>
            {activeItems.length >= 3 && (
              <p className="text-sm text-muted-ink mt-3 leading-relaxed" role="status">
                {tPlan("addAnotherStopHint")}
              </p>
            )}
            {activePlaces.length > 0 && <PlanDayHints places={activePlaces} />}
          </div>

          <div className={CARD.content}>
            {activeItems.length === 0 ? (
              <EmptyDayState
                activeDay={activeDay}
                onBrowseAll={onBrowseAll}
                onScrollToQuickStart={onScrollToQuickStart}
                readOnly={readOnly}
                planIsEmpty={planIsEmpty}
              />
            ) : (
              <div className="space-y-0">
                {useBlocks ? (
                  <>
                    <div className={`pt-1 ${SECTION.headingGap} ps-12 max-[360px]:ps-8`}>
                      <span className={`${TYPE.kicker} text-muted-ink`}>{tPlan("morning")}</span>
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
                          removeFromDay={announceRemoveFromDay}
                          readOnly={readOnly}
                        />
                      ))}
                    </div>
                    {afternoonIds.length > 0 && (
                      <>
                        <div className={`mt-8 ${SECTION.headingGap} ps-12 max-[360px]:ps-8`}>
                          <span className={`${TYPE.kicker} text-muted-ink`}>{tPlan("afternoon")}</span>
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
                              removeFromDay={announceRemoveFromDay}
                              readOnly={readOnly}
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
                        removeFromDay={announceRemoveFromDay}
                        readOnly={readOnly}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div id="plan-add-sentinel" aria-hidden className="h-0" />
        {!hideInlineAdd && !readOnly && (
          <DayAddSection
            activeDay={activeDay}
            activeItems={activeItems}
            getPlace={getPlace}
            addToDay={addToDay}
            onBrowseAll={onBrowseAll}
            readOnly={readOnly}
          />
        )}
      </div>
    </section>
  );
}
