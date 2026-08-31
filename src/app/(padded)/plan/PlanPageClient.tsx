"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ListPageHero from "@/components/ListPageHero";
import dynamic from "next/dynamic";
const ClearDayModal = dynamic(() => import("@/components/plan/ClearDayModal"), { ssr: false });
import DayContentPanel from "@/components/plan/DayContentPanel";
import DaySelector from "@/components/plan/DaySelector";
import PlanAddFailedAlert from "@/components/plan/PlanAddFailedAlert";
import PlanDaysUntilBanner from "@/components/plan/PlanDaysUntilBanner";
import PlanFooter from "@/components/plan/PlanFooter";
import PlanMapCollapsibleSection from "@/components/plan/PlanMapCollapsibleSection";
import PlanAddMoreCollapsible from "@/components/plan/PlanAddMoreCollapsible";
import PlanShareBar from "@/components/plan/PlanShareBar";
import PlanStartHere from "@/components/plan/PlanStartHere";
import PlanStickyAddBar from "@/components/plan/PlanStickyAddBar";
import PlanTripDatesWidget from "@/components/plan/PlanTripDatesWidget";
import PlanWineryBar from "@/components/plan/PlanWineryBar";
import PlanGuideBar from "@/components/plan/PlanGuideBar";
const PlacePickerModal = dynamic(() => import("@/components/plan/PlacePickerModal"), { ssr: false });
import QuickStartSection from "@/components/plan/QuickStartSection";
import BuildADaySection from "@/components/plan/BuildADaySection";
const ComboChoiceModal = dynamic(() => import("@/components/plan/ComboChoiceModal"), { ssr: false });
const TemplateChoiceModal = dynamic(() => import("@/components/plan/TemplateChoiceModal"), { ssr: false });
import { usePlanPage } from "@/hooks/usePlanPage";
import { useOnboardingContext } from "@/contexts/OnboardingContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations, useLocale } from "next-intl";
import { track, trackProduct } from "@/lib/analytics";
import { matchGuidesForPlanItemIds } from "@/lib/guide-match";
import OnboardingContextualTip from "@/components/OnboardingContextualTip";
import { ITINERARY_TEMPLATES } from "@/data/itinerary-templates";
import AppLink from "@/components/AppLink";
import TravelTrustStrip from "@/components/travel/TravelTrustStrip";
import PlanSustainabilityStrip from "@/components/plan/PlanSustainabilityStrip";
import PlanOfflineBanner from "@/components/plan/PlanOfflineBanner";
import { HOME, LAYOUT, CTA, SECTION } from "@/lib/design-tokens";

export default function PlanPageClient() {
  const searchParams = useSearchParams();
  const tPlanQuick = useTranslations("planQuick");
  // Localized template names — the TS `label` is the EN base; interpolating it
  // into the localized modal title leaked English names (AUD-99 class).
  const templateLabels: Record<string, string> = Object.fromEntries(
    ITINERARY_TEMPLATES.map((t) => [
      t.key,
      tPlanQuick(`templates.items.${t.key}.label` as "templates.items.short-stay.label"),
    ])
  );
  const plan = usePlanPage();
  const { setPlanItemCount, showTipPlanEmpty, dismissTipPlanEmpty, showTipFirstAdd, dismissTipFirstAdd } =
    useOnboardingContext();
  const { user } = useAuth();
  const t = useTranslations("onboarding");
  const tPlan = useTranslations("plan");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const hasTrackedPlanView = useRef(false);

  const hasTrackedFirstAdd = useRef(false);
  useEffect(() => {
    if (plan.hydrated) setPlanItemCount(plan.totalPlaces);
  }, [plan.hydrated, plan.totalPlaces, setPlanItemCount]);
  useEffect(() => {
    if (plan.hydrated && plan.totalPlaces >= 1 && !hasTrackedFirstAdd.current) {
      hasTrackedFirstAdd.current = true;
      track("first_add_to_plan", { count: plan.totalPlaces });
    }
  }, [plan.hydrated, plan.totalPlaces]);

  useEffect(() => {
    if (!plan.hydrated || hasTrackedPlanView.current) return;
    hasTrackedPlanView.current = true;
    trackProduct("plan_view", {
      item_count: plan.totalPlaces,
      day_count: plan.activeDaysCount,
      has_content: plan.hasContent,
    });
  }, [plan.hydrated, plan.totalPlaces, plan.activeDaysCount, plan.hasContent]);

  const {
    showClearModal,
    setShowClearModal,
    templateChoice,
    setTemplateChoice,
    comboChoice,
    setComboChoice,
    showBrowseModal,
    setShowBrowseModal,
    dates,
    setTripDates,
    datesHydrated,
    daysUntil,
    withinSevenDays,
    tripLength,
    days,
    activeDay,
    setActiveDay,
    activeItems,
    hydrated,
    copied,
    addToDayIfMissing,
    removeFromDay,
    getPlace,
    lastAddedId,
    hasContent,
    hasWineries,
    hasTrails,
    copyItinerary,
    copyShareLink,
    linkCopied,
    icsDownloaded,
    downloadCalendar,
    sharePath,
    sharePreviewLine,
    shareText,
    templateAppliedFromUrl,
    totalPlaces,
    activeDaysCount,
    displayDaysCount,
    lastAddedCardRef,
    quickStartRef,
    handleTemplateClick,
    handleReplaceTemplate,
    handleAddTemplate,
    handleComboClick,
    handleAddCombo,
    handleReplaceCombo,
    handleClearDayConfirm,
    scrollToQuickStart,
    planReadOnly,
  } = plan;

  const allPlanItemIds = Object.values(days).flat();
  const guideMatch = matchGuidesForPlanItemIds(allPlanItemIds, locale);

  const quickStartBlock = (
    <>
      {!hasContent && hydrated && showTipPlanEmpty && (
        <OnboardingContextualTip
          message={t("tipPlanEmpty")}
          onDismiss={dismissTipPlanEmpty}
          href="/discover"
          hrefLabel={t("tipPlanEmptyLink")}
        />
      )}
      <QuickStartSection
        activeDay={activeDay}
        days={days}
        getPlace={getPlace}
        addToDay={addToDayIfMissing}
        onTemplateClick={handleTemplateClick}
        hasContent={hasContent}
        tripLength={tripLength}
        readOnly={planReadOnly}
      />
      {!hasContent ? (
        <details className="group rounded-2xl border border-sand-200/80 bg-white/70 shadow-sm open:shadow-md open:bg-white/90 transition-shadow">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl p-4 sm:p-5 text-start select-none [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-sand min-h-[48px]">
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold text-charcoal">{tPlan("combosCollapsibleTitle")}</p>
              <p className="text-xs text-muted-ink mt-0.5">{tPlan("combosCollapsibleSubtitle")}</p>
            </div>
            <span className="text-olive/45 group-open:rotate-180 transition-transform shrink-0" aria-hidden>
              ▾
            </span>
          </summary>
          <div className="border-t border-sand-200/60 px-3 pb-6 pt-4 sm:px-5">
            <BuildADaySection hasContent={hasContent} onComboClick={handleComboClick} readOnly={planReadOnly} />
          </div>
        </details>
      ) : (
        <BuildADaySection hasContent={hasContent} onComboClick={handleComboClick} readOnly={planReadOnly} />
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-sand">
      <div
        className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyPlan} flex flex-col gap-8 sm:gap-12 md:gap-16`}
      >
        {copied && (
          <div className="sr-only" role="status" aria-live="polite">
            {tPlan("aria.itineraryCopied")}
          </div>
        )}
        {linkCopied && (
          <div className="sr-only" role="status" aria-live="polite">
            {tPlan("aria.shareLinkCopied")}
          </div>
        )}

        {searchParams.get("add") && !hydrated && (
          <p className={`text-sm text-muted-ink ${SECTION.headingGap}`} role="status" aria-live="polite">
            {tPlan("addingToPlan")}
          </p>
        )}

        {(plan.addFailed || searchParams.get("add") === "failed") && <PlanAddFailedAlert />}

        <header>
          <ListPageHero
            backHref="/"
            backLabel={tNav("home")}
            title={tPlan("pageTitle")}
            description={
              hasContent
                ? tPlan("pageDescHasContent")
                : tPlan("pageDescEmpty")
            }
            descriptionSecondary={!hasContent ? tPlan("pageDescSecondaryEmpty") : undefined}
            backgroundImage="/images/cyprus/cyprus-village-omodos.jpg"
            backgroundImageAlt={tPlan("heroImageAlt")}
            hasWidgetStrip={hasContent}
            breadcrumbItems={[{ label: tNav("home"), href: "/" }, { label: tNav("plan"), href: "/plan", isCurrent: true }]}
          >
            {!hasContent && (
              <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row gap-3 sm:items-center">
                <button
                  type="button"
                  onClick={scrollToQuickStart}
                  className={`${CTA.primaryCompact} active:scale-[0.98] motion-reduce:active:scale-100 w-full sm:w-auto transition-transform duration-150 ease-out`}
                  aria-label={tPlan("aria.scrollToTemplates")}
                >
                  {tPlan("seeTemplates")}
                </button>
                <AppLink
                  href="/discover"
                  className={`${CTA.secondaryCompact} w-full sm:w-auto text-center`}
                  aria-label={tPlan("browsePlaces")}
                >
                  {tPlan("heroBrowsePlaces")}
                </AppLink>
              </div>
            )}
          </ListPageHero>
        </header>

        {hasContent && totalPlaces === 1 && showTipFirstAdd && (
          <div className={SECTION.headingGap}>
            <OnboardingContextualTip
              message={t("tipFirstAdd")}
              onDismiss={dismissTipFirstAdd}
            />
          </div>
        )}

        <div className="mb-4">
          <PlanOfflineBanner />
        </div>

        {hasContent && hydrated && (
          <PlanShareBar
            totalPlaces={totalPlaces}
            activeDaysCount={activeDaysCount}
            displayDaysCount={displayDaysCount}
            copied={copied}
            linkCopied={linkCopied}
            sharePath={sharePath}
            sharePreviewLine={sharePreviewLine}
            shareText={shareText}
            copyShareLink={copyShareLink}
            copyItinerary={copyItinerary}
            icsDownloaded={icsDownloaded}
            downloadCalendar={downloadCalendar}
          />
        )}

        {hasContent && hydrated && templateAppliedFromUrl === "short-stay" && (
          <PlanStartHere
            onJumpToTonight={() => {
              setActiveDay(1);
              document.getElementById("plan-itinerary")?.scrollIntoView({
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
                block: "start",
              });
            }}
            onAddFirstStop={() => {
              if (!planReadOnly) setShowBrowseModal(true);
            }}
          />
        )}

        {!hasContent && (
          <div ref={quickStartRef} aria-label={tPlan("aria.quickStartRegion")} className="scroll-mt-24 sm:scroll-mt-28">
            {quickStartBlock}
          </div>
        )}

        {datesHydrated && withinSevenDays && daysUntil !== null && (
          <PlanDaysUntilBanner daysUntil={daysUntil} />
        )}

        {datesHydrated && (
          <PlanTripDatesWidget
            dates={dates}
            setTripDates={setTripDates}
            withinSevenDays={withinSevenDays}
            defaultCollapsed={!hasContent}
          />
        )}

        {hasWineries && hydrated && <PlanWineryBar />}

        {hasTrails && hydrated && (
          <PlanGuideBar
            verifiedGuides={guideMatch.verifiedGuides}
            district={guideMatch.district}
            language={guideMatch.language}
            licensedCount={guideMatch.licensedCount}
          />
        )}

        <div id="plan-itinerary" className="flex flex-col gap-10 sm:gap-14 scroll-mt-24 sm:scroll-mt-28">
          {hasContent && (
            <DaySelector
              days={days}
              activeDay={activeDay}
              setActiveDay={setActiveDay}
              activeDaysCount={activeDaysCount}
              displayDaysCount={displayDaysCount}
              getPlace={getPlace}
              hasContent={hasContent}
            />
          )}

          <DayContentPanel
            activeDay={activeDay}
            activeItems={activeItems}
            getPlace={getPlace}
            addToDay={addToDayIfMissing}
            removeFromDay={removeFromDay}
            lastAddedId={lastAddedId}
            lastAddedCardRef={lastAddedCardRef}
            onClearDay={() => setShowClearModal(true)}
            onBrowseAll={() => {
              if (!planReadOnly) setShowBrowseModal(true);
            }}
            onScrollToQuickStart={scrollToQuickStart}
            hideInlineAdd={!hasContent}
            readOnly={planReadOnly}
          />

          {hasContent && hydrated && <PlanMapCollapsibleSection />}

          {hasContent && (
            <div ref={quickStartRef} aria-label={tPlan("aria.quickStartRegion")}>
              <PlanAddMoreCollapsible hasContent={hasContent}>{quickStartBlock}</PlanAddMoreCollapsible>
            </div>
          )}
        </div>

        <div className={`${LAYOUT.safeAreaX} ${LAYOUT.list} mx-auto ${SECTION.blockGap} flex flex-col ${HOME.gridGap}`}>
          <PlanSustainabilityStrip />
          <TravelTrustStrip />
        </div>

        <PlanFooter hasWineries={hasWineries} showAccountCTA={!user && totalPlaces >= 2} />

        {showClearModal && (
          <ClearDayModal
            activeDay={activeDay}
            placeCount={activeItems.length}
            onClose={() => setShowClearModal(false)}
            onConfirm={handleClearDayConfirm}
          />
        )}

        {hasContent && hydrated && !planReadOnly && (
          <PlanStickyAddBar
            sentinelId="plan-add-sentinel"
            scrollTargetId="plan-inline-add"
            onAddPlaceClick={() => setShowBrowseModal(true)}
          />
        )}

        {showBrowseModal && (
          <PlacePickerModal
            activeDayItems={activeItems}
            onAdd={addToDayIfMissing}
            onClose={() => setShowBrowseModal(false)}
          />
        )}

        {templateChoice && hasContent && (
          <TemplateChoiceModal
            templateLabel={templateLabels[templateChoice] ?? templateChoice}
            onClose={() => setTemplateChoice(null)}
            onAddToPlan={handleAddTemplate}
            onReplace={handleReplaceTemplate}
          />
        )}

        {comboChoice && (
          <ComboChoiceModal
            comboLabel={comboChoice.label}
            onClose={() => setComboChoice(null)}
            onAddToPlan={handleAddCombo}
            onReplace={handleReplaceCombo}
          />
        )}
      </div>
    </div>
  );
}
