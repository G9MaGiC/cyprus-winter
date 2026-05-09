"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ListPageHero from "@/components/ListPageHero";
import ClearDayModal from "@/components/plan/ClearDayModal";
import DayContentPanel from "@/components/plan/DayContentPanel";
import DaySelector from "@/components/plan/DaySelector";
import PlanAddFailedAlert from "@/components/plan/PlanAddFailedAlert";
import PlanDaysUntilBanner from "@/components/plan/PlanDaysUntilBanner";
import PlanFooter from "@/components/plan/PlanFooter";
import PlanMapCollapsibleSection from "@/components/plan/PlanMapCollapsibleSection";
import PlanAddMoreCollapsible from "@/components/plan/PlanAddMoreCollapsible";
import PlanShareBar from "@/components/plan/PlanShareBar";
import PlanStickyAddBar from "@/components/plan/PlanStickyAddBar";
import PlanTripDatesWidget from "@/components/plan/PlanTripDatesWidget";
import PlanWineryBar from "@/components/plan/PlanWineryBar";
import PlacePickerModal from "@/components/plan/PlacePickerModal";
import QuickStartSection from "@/components/plan/QuickStartSection";
import BuildADaySection from "@/components/plan/BuildADaySection";
import ComboChoiceModal from "@/components/plan/ComboChoiceModal";
import TemplateChoiceModal from "@/components/plan/TemplateChoiceModal";
import { usePlanPage } from "@/hooks/usePlanPage";
import { useOnboardingContext } from "@/contexts/OnboardingContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";
import { track, trackProduct } from "@/lib/analytics";
import OnboardingContextualTip from "@/components/OnboardingContextualTip";
import { ITINERARY_TEMPLATES } from "@/data/itinerary-templates";
import { LAYOUT, CTA, SECTION } from "@/lib/design-tokens";

const TEMPLATE_LABELS: Record<string, string> = Object.fromEntries(
  ITINERARY_TEMPLATES.map((t) => [t.key, t.label])
);

export default function PlanPage() {
  const searchParams = useSearchParams();
  const plan = usePlanPage();
  const { setPlanItemCount, showTipPlanEmpty, dismissTipPlanEmpty, showTipFirstAdd, dismissTipFirstAdd } =
    useOnboardingContext();
  const { user } = useAuth();
  const t = useTranslations("onboarding");
  const tPlan = useTranslations("plan");
  const tNav = useTranslations("nav");
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
    copyItinerary,
    copyShareLink,
    linkCopied,
    sharePath,
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
  } = plan;

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
          <p className={`text-sm text-olive/70 ${SECTION.headingGap}`} role="status" aria-live="polite">
            {tPlan("addingToPlan")}
          </p>
        )}

        {searchParams.get("add") === "failed" && <PlanAddFailedAlert />}

        <header role="banner">
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
              <div className="mt-4 sm:mt-5">
                <button
                  type="button"
                  onClick={scrollToQuickStart}
                  className={`${CTA.primaryCompact} active:scale-[0.98] motion-reduce:active:scale-100 w-full sm:w-auto transition-transform duration-150 ease-out`}
                  aria-label={tPlan("aria.scrollToTemplates")}
                >
                  {tPlan("seeTemplates")}
                </button>
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
          <PlanDaysUntilBanner daysUntil={daysUntil} />
        )}

        {datesHydrated && (
          <PlanTripDatesWidget
            dates={dates}
            setTripDates={setTripDates}
            withinSevenDays={withinSevenDays}
          />
        )}

        {hasWineries && hydrated && <PlanWineryBar />}

        <div className="flex flex-col gap-10 sm:gap-14">
          <DaySelector
            days={days}
            activeDay={activeDay}
            setActiveDay={setActiveDay}
            activeDaysCount={activeDaysCount}
            displayDaysCount={displayDaysCount}
            getPlace={getPlace}
            hasContent={hasContent}
          />

          <DayContentPanel
            activeDay={activeDay}
            activeItems={activeItems}
            getPlace={getPlace}
            addToDay={addToDayIfMissing}
            removeFromDay={removeFromDay}
            lastAddedId={lastAddedId}
            lastAddedCardRef={lastAddedCardRef}
            onClearDay={() => setShowClearModal(true)}
            onBrowseAll={() => setShowBrowseModal(true)}
            onScrollToQuickStart={scrollToQuickStart}
          />

          {hasContent && hydrated && <PlanMapCollapsibleSection />}

          <div ref={quickStartRef} aria-label={tPlan("aria.quickStartRegion")}>
            <PlanAddMoreCollapsible hasContent={hasContent}>
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
              />
              <BuildADaySection
                hasContent={hasContent}
                onComboClick={handleComboClick}
              />
            </PlanAddMoreCollapsible>
          </div>
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

        <PlanStickyAddBar
          sentinelId="plan-add-sentinel"
          scrollTargetId="plan-inline-add"
          onAddPlaceClick={() => setShowBrowseModal(true)}
        />

        {showBrowseModal && (
          <PlacePickerModal
            activeDayItems={activeItems}
            onAdd={addToDayIfMissing}
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
