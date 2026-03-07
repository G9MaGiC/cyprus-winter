"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ListPageHero from "@/components/ListPageHero";
import ListPageWidgetStrip from "@/components/ListPageWidgetStrip";
import ClearDayModal from "@/components/plan/ClearDayModal";
import DayContentPanel from "@/components/plan/DayContentPanel";
import DaySelector from "@/components/plan/DaySelector";
import PlanShareBar from "@/components/plan/PlanShareBar";
import PlanStickyAddBar from "@/components/plan/PlanStickyAddBar";
import PlacePickerModal from "@/components/plan/PlacePickerModal";
import QuickStartSection from "@/components/plan/QuickStartSection";
import TemplateChoiceModal from "@/components/plan/TemplateChoiceModal";
import { useSearchParams } from "next/navigation";
import { LAYOUT, SECTION, CTA } from "@/lib/design-tokens";
import { useItinerary, MAX_DAYS } from "@/hooks/useItinerary";
import { usePlanUrlActions } from "@/hooks/usePlanUrlActions";
import { useTripDates } from "@/hooks/useTripDates";
import { ITINERARY_TEMPLATES, type TemplateKey } from "@/data/itinerary-templates";
import PushOptIn from "@/components/PushOptIn";
import SectionCard from "@/components/SectionCard";

const TEMPLATE_LABELS: Record<string, string> = Object.fromEntries(
  ITINERARY_TEMPLATES.map((t) => [t.key, t.label])
);

export default function PlanPage() {
  const searchParams = useSearchParams();
  const [showClearModal, setShowClearModal] = useState(false);
  const [templateChoice, setTemplateChoice] = useState<string | null>(null);
  const [showBrowseModal, setShowBrowseModal] = useState(false);

  const { dates, setTripDates, hydrated: datesHydrated, daysUntil, withinSevenDays, tripLength } = useTripDates();
  const {
    days,
    activeDay,
    setActiveDay,
    hydrated,
    copied,
    addToDay,
    removeFromDay,
    getPlace,
    lastAddedId,
    hasContent,
    hasWineries,
    applyTemplate,
    mergeTemplate,
    clearDay,
    copyItinerary,
    copyShareLink,
    linkCopied,
    sharePath,
  } = useItinerary();

  const activeItems = days[activeDay] ?? [];
  const totalPlaces = Object.values(days).flat().length;
  const activeDaysCount = Object.keys(days).filter((d) => (days[Number(d)] ?? []).length > 0).length;
  const displayDaysCount = tripLength ?? (hasContent ? MAX_DAYS : 1);
  const lastAddedCardRef = useRef<HTMLDivElement | null>(null);
  const quickStartRef = useRef<HTMLDivElement | null>(null);

  usePlanUrlActions({ hydrated, hasContent, getPlace, addToDay, applyTemplate });

  useEffect(() => {
    if (lastAddedId && lastAddedCardRef.current) {
      lastAddedCardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [lastAddedId]);

  useEffect(() => {
    if (activeDay > displayDaysCount) {
      setActiveDay(displayDaysCount);
    }
  }, [activeDay, displayDaysCount, setActiveDay]);

  const handleTemplateClick = (key: string) => {
    if (!hasContent) {
      applyTemplate(key as TemplateKey);
      return;
    }
    setTemplateChoice(key);
  };

  const handleReplaceTemplate = () => {
    if (!templateChoice) return;
    applyTemplate(templateChoice as TemplateKey, true);
    setTemplateChoice(null);
  };

  const handleAddTemplate = () => {
    if (!templateChoice) return;
    mergeTemplate(templateChoice as TemplateKey);
    setTemplateChoice(null);
  };

  return (
    <div className="min-h-screen bg-sand">
      <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} ${SECTION.blockGap} pb-24 sm:pb-16`}>
        {copied && (
          <div className="sr-only" role="status" aria-live="polite">
            Itinerary copied to clipboard
          </div>
        )}
        {linkCopied && (
          <div className="sr-only" role="status" aria-live="polite">
            Share link copied to clipboard
          </div>
        )}

        {searchParams.get("add") && !hydrated && (
          <p className="text-sm text-olive/70 mb-4" role="status" aria-live="polite">
            Adding to your plan…
          </p>
        )}

        {searchParams.get("add") === "failed" && (
          <div
            className="mb-4 p-4 rounded-xl bg-terracotta/10 border border-terracotta/30 text-sm text-olive"
            role="alert"
            aria-live="assertive"
          >
            <p className="mb-3">That place isn&apos;t in our list anymore.</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/discover" className={CTA.secondaryCompact}>
                Browse Discover
              </Link>
              <Link href="/trails" className={CTA.secondaryCompact}>
                View trails
              </Link>
            </div>
          </div>
        )}

        <header role="banner">
          <ListPageHero
            backHref="/"
            backLabel="Home"
            title="Plan your Cyprus winter trip"
            description="Pick a template or add places. Your plan saves as you go."
            backgroundImage="/images/cyprus/cyprus-village-omodos.jpg"
            backgroundImageAlt="Omodos village, wine heartland—plan your Cyprus winter trip"
            hasWidgetStrip={hasContent}
          >
            <div
              className={`mt-2 ${hasContent ? "" : "mt-4"}`}
            >
              {!hasContent && (
                <>
                  <button
                    type="button"
                    onClick={() => quickStartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className={`${CTA.primaryCompact} active:scale-[0.98] motion-reduce:active:scale-100 w-full sm:w-auto`}
                  >
                    Pick a template or add your first place
                  </button>
                  <p className="text-sm text-white/80 mt-2">
                    No account needed. Plan saves as you go.
                  </p>
                </>
              )}
            </div>
          </ListPageHero>
        </header>

        {hasContent && hydrated && (
          <PlanShareBar
            totalPlaces={totalPlaces}
            activeDaysCount={activeDaysCount}
            displayDaysCount={displayDaysCount}
            copied={copied}
            linkCopied={linkCopied}
            sharePath={sharePath}
            copyShareLink={copyShareLink}
            copyItinerary={copyItinerary}
          />
        )}

        {datesHydrated && withinSevenDays && daysUntil !== null && (
          <div
            role="status"
            className="mb-6 p-4 rounded-xl bg-aegean/10 border border-aegean/20"
          >
            <p className="text-sm font-medium text-olive">
              {daysUntil === 0
                ? "Your trip is today — your Day 1 plan is ready."
                : daysUntil === 1
                  ? "Tomorrow you are here — your Day 1 plan is ready."
                  : `${daysUntil} days until you are here — your Day 1 plan is ready.`}
            </p>
            <p className="text-xs text-olive/70 mt-1">
              {daysUntil === 0 ? "Have a great day." : daysUntil === 1 ? "Have a safe journey." : "Review your itinerary below."}
            </p>
          </div>
        )}

        {datesHydrated && (
          <ListPageWidgetStrip ariaLabel="Trip dates">
            <SectionCard title="When are you traveling?" borderAccent="aegean">
              <div className="flex flex-wrap gap-3 mb-4">
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-olive/60">Start</span>
                  <input
                    type="date"
                    value={dates.start ?? ""}
                    onChange={(e) => setTripDates(e.target.value || null, dates.end)}
                    className="min-h-[44px] px-3 py-2 rounded-lg border border-sand-300 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/50"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-olive/60">End</span>
                  <input
                    type="date"
                    value={dates.end ?? ""}
                    onChange={(e) => setTripDates(dates.start, e.target.value || null)}
                    className="min-h-[44px] px-3 py-2 rounded-lg border border-sand-300 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/50"
                  />
                </label>
              </div>
              {dates.start && (
                <PushOptIn tripStartDate={dates.start} variant={withinSevenDays ? "soon" : "far"} />
              )}
            </SectionCard>
          </ListPageWidgetStrip>
        )}

        {hasWineries && hydrated && (
          <SectionCard
            title="You've added wineries. Book tastings ahead—many run lean in winter."
            borderAccent="terracotta"
            className="bg-terracotta/5 border-terracotta/30 mb-6 sm:mb-8"
          >
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/bookings" className={CTA.primaryCompact}>
                Book your tastings
              </Link>
              <Link href="/discover?filter=winery" className={CTA.secondaryCompact}>
                Browse wineries
              </Link>
              <Link
                href="/bookings"
                className="inline-flex items-center min-h-[44px] px-4 py-2 rounded-lg text-olive/80 font-medium hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                My bookings
              </Link>
            </div>
          </SectionCard>
        )}

        <div className="flex flex-col">
          <div className={hasContent ? "order-1" : "order-2"}>
            <DaySelector
              days={days}
              activeDay={activeDay}
              setActiveDay={setActiveDay}
              activeDaysCount={activeDaysCount}
              displayDaysCount={displayDaysCount}
              getPlace={getPlace}
              hasContent={hasContent}
            />
          </div>

          <div ref={quickStartRef} className={hasContent ? "order-2" : "order-1"}>
            <QuickStartSection
              activeDay={activeDay}
              days={days}
              getPlace={getPlace}
              addToDay={addToDay}
              onTemplateClick={handleTemplateClick}
              hasContent={hasContent}
              tripLength={tripLength}
            />
          </div>
        </div>

        <DayContentPanel
          activeDay={activeDay}
          activeItems={activeItems}
          getPlace={getPlace}
          addToDay={addToDay}
          removeFromDay={removeFromDay}
          lastAddedId={lastAddedId}
          lastAddedCardRef={lastAddedCardRef}
          onClearDay={() => setShowClearModal(true)}
          onBrowseAll={() => setShowBrowseModal(true)}
          onScrollToQuickStart={() => quickStartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        />

        <div className="mt-10 sm:mt-12 pt-8 border-t border-sand-200/80 text-center">
          <p className="text-olive/60 text-sm break-words px-4 mb-4">
            Daylight ends around 5pm. Start early, save when you&apos;re ready.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {hasWineries && (
              <Link href="/bookings" className="font-medium text-aegean hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 focus-visible:ring-offset-2 rounded">
                Book tastings
              </Link>
            )}
            <Link href="/discover" className="font-medium text-aegean hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 focus-visible:ring-offset-2 rounded">
              Discover places
            </Link>
            <Link href="/trails" className="font-medium text-aegean hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 focus-visible:ring-offset-2 rounded">
              Explore trails
            </Link>
            <Link href="/weather" className="font-medium text-aegean hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 focus-visible:ring-offset-2 rounded">
              Weather
            </Link>
          </div>
        </div>

        {showClearModal && (
          <ClearDayModal
            activeDay={activeDay}
            placeCount={activeItems.length}
            onClose={() => setShowClearModal(false)}
            onConfirm={() => {
              clearDay();
              setShowClearModal(false);
            }}
          />
        )}

        <PlanStickyAddBar
          sentinelId="plan-add-sentinel"
          scrollTargetId="plan-inline-add"
          onAddPlaceClick={() => setShowBrowseModal(true)}
        />

        {showBrowseModal && (
          <PlacePickerModal
            activeDayItems={activeItems}
            onAdd={addToDay}
            onClose={() => setShowBrowseModal(false)}
          />
        )}

        {templateChoice && hasContent && (
          <TemplateChoiceModal
            templateLabel={TEMPLATE_LABELS[templateChoice] ?? templateChoice}
            onClose={() => setTemplateChoice(null)}
            onAddToPlan={handleAddTemplate}
            onReplace={handleReplaceTemplate}
          />
        )}
      </div>
    </div>
  );
}
