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
import BuildADaySection from "@/components/plan/BuildADaySection";
import TemplateChoiceModal from "@/components/plan/TemplateChoiceModal";
import { useSearchParams } from "next/navigation";
import { useItinerary, MAX_DAYS } from "@/hooks/useItinerary";
import { usePlanUrlActions } from "@/hooks/usePlanUrlActions";
import { useTripDates } from "@/hooks/useTripDates";
import { ITINERARY_TEMPLATES, type TemplateKey } from "@/data/itinerary-templates";
import PushOptIn from "@/components/PushOptIn";
import { LAYOUT, SECTION, CTA } from "@/lib/design-tokens";

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
      <div
        className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyPlan} flex flex-col gap-6 min-[400px]:gap-8 sm:gap-12 md:gap-14`}
      >
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
            className="p-4 sm:p-5 rounded-xl bg-terracotta/5 border border-terracotta/25 text-sm text-olive"
            role="alert"
            aria-live="assertive"
          >
            <p className={SECTION.titleGap}>That place isn&apos;t in our list anymore.</p>
            <div className="flex flex-wrap gap-2 sm:gap-3">
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
            description={hasContent ? "Your itinerary — add more or share." : "Pick a template or build day by day."}
            descriptionSecondary={!hasContent ? "Saves as you go." : undefined}
            backgroundImage="/images/cyprus/cyprus-village-omodos.jpg"
            backgroundImageAlt="Omodos village, wine heartland—plan your Cyprus winter trip"
            hasWidgetStrip={hasContent}
            breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Plan", href: "/plan", isCurrent: true }]}
          >
            {!hasContent && (
              <div className="mt-3 sm:mt-4">
                <button
                  type="button"
                  onClick={() => quickStartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className={`${CTA.primaryCompact} active:scale-[0.98] motion-reduce:active:scale-100 w-full sm:w-auto transition-transform duration-150 ease-out`}
                >
                  Pick a template or build a day
                </button>
              </div>
            )}
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
            className="rounded-xl border-2 border-dashed border-golden/30 bg-golden/5 px-4 py-3.5 sm:px-5 sm:py-4 transition-opacity duration-200"
          >
            <p className="text-sm font-medium text-olive">
              {daysUntil === 0
                ? "Trip today — Day 1 is ready."
                : daysUntil === 1
                  ? "Tomorrow — Day 1 is ready."
                  : `${daysUntil} days to go — review below.`}
            </p>
          </div>
        )}

        {datesHydrated && (
          <ListPageWidgetStrip ariaLabel="Trip dates">
            <div className="rounded-2xl border-2 border-dashed border-sand-200/90 bg-sand-100/60 p-5 sm:p-6 transition-colors hover:border-aegean/20">
              <p className="text-sm font-semibold text-olive mb-4">When are you traveling?</p>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 mb-5">
                <label className="flex flex-col gap-1.5">
                  <span className="prose-label text-olive/60">Start</span>
                  <input
                    type="date"
                    value={dates.start ?? ""}
                    onChange={(e) => setTripDates(e.target.value || null, dates.end)}
                    className="min-h-[44px] w-full px-3 py-2.5 rounded-lg border border-sand-300 bg-white text-charcoal text-base focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:ring-offset-1"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="prose-label text-olive/60">End</span>
                  <input
                    type="date"
                    value={dates.end ?? ""}
                    onChange={(e) => setTripDates(dates.start, e.target.value || null)}
                    className="min-h-[44px] w-full px-3 py-2.5 rounded-lg border border-sand-300 bg-white text-charcoal text-base focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:ring-offset-1"
                  />
                </label>
              </div>
              {dates.start && (
                <PushOptIn tripStartDate={dates.start} variant={withinSevenDays ? "soon" : "far"} />
              )}
            </div>
          </ListPageWidgetStrip>
        )}

        {hasWineries && hydrated && (
          <div
            role="region"
            aria-label="Winery bookings"
            className="rounded-2xl border-2 border-dashed border-sand-200/90 bg-sand-100/60 p-4 sm:p-5 flex flex-wrap items-center gap-2 sm:gap-3 min-h-[44px]"
          >
            <Link href="/bookings" className={CTA.primaryCompact}>
              Book tastings
            </Link>
            <Link href="/discover?filter=winery" className={CTA.secondaryCompact}>
              Browse wineries
            </Link>
            <Link href="/bookings" className={SECTION.aegeanLink}>
              My bookings
            </Link>
          </div>
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

          <div ref={quickStartRef} className={`${hasContent ? "order-2" : "order-1"} flex flex-col gap-10 sm:gap-14 md:gap-16`}>
            {!hasContent ? (
              <>
                <QuickStartSection
                  activeDay={activeDay}
                  days={days}
                  getPlace={getPlace}
                  addToDay={addToDay}
                  onTemplateClick={handleTemplateClick}
                  hasContent={hasContent}
                  tripLength={tripLength}
                />
                <BuildADaySection />
              </>
            ) : (
              <>
                <QuickStartSection
                  activeDay={activeDay}
                  days={days}
                  getPlace={getPlace}
                  addToDay={addToDay}
                  onTemplateClick={handleTemplateClick}
                  hasContent={hasContent}
                  tripLength={tripLength}
                />
                <BuildADaySection />
              </>
            )}
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

        <footer className={`${SECTION.footerBlock} pt-8 pb-[env(safe-area-inset-bottom)] sm:pt-10 sm:pb-0`}>
          <p className="text-olive/60 text-xs sm:text-sm break-words text-center mb-5 max-w-xl mx-auto">
            Winter tip: daylight ends around 5pm. Start trails by 10am; book tastings 24–48h ahead.
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-3 text-sm">
            {hasWineries && (
              <Link href="/bookings" className={SECTION.aegeanLink}>
                Book tastings
              </Link>
            )}
            <Link href="/discover" className={SECTION.aegeanLink}>
              Discover places
            </Link>
            <Link href="/trails" className={SECTION.aegeanLink}>
              Explore trails
            </Link>
            <Link href="/weather" className={SECTION.aegeanLink}>
              Weather
            </Link>
          </div>
        </footer>

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
