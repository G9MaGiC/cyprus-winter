"use client";

import { useEffect } from "react";
import AppLink from "@/components/AppLink";
import { CARD, TYPE, PILL } from "@/lib/design-tokens";
import { ITINERARY_TEMPLATES, type TemplateKey } from "@/data/itinerary-templates";
import { PLAN_QUICK_ADD_PLACES } from "@/data/plan-quick-add";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { getRecommendedTemplates } from "@/lib/personalization";
import type { PlanItem } from "@/data";
import { useTranslations } from "next-intl";
import { track } from "@/lib/analytics";

type QuickStartSectionProps = {
  activeDay: number;
  days: Record<number, string[]>;
  getPlace: (id: string) => PlanItem | undefined;
  addToDay: (id: string) => void;
  onTemplateClick: (key: TemplateKey) => void;
  hasContent: boolean;
  tripLength: number | null;
};

function isRecommendedForTrip(template: (typeof ITINERARY_TEMPLATES)[number], tripLength: number): boolean {
  return template.duration === tripLength || Math.abs(template.duration - tripLength) <= 1;
}

function getTripFitKey(templateDuration: number, tripLength: number): string {
  const delta = templateDuration - tripLength;
  if (delta === 0) return "fitExact";
  if (Math.abs(delta) === 1) return "fitNear";
  return delta > 0 ? "fitCompress" : "fitExtend";
}

export default function QuickStartSection({
  activeDay,
  days,
  getPlace,
  addToDay,
  onTemplateClick,
  hasContent,
  tripLength,
}: QuickStartSectionProps) {
  const tPlanQuick = useTranslations("planQuick");
  const activeDayItems = days[activeDay] ?? [];
  const { prefs, hydrated } = useUserPreferences();

  const forYou = hydrated && (prefs.interests.length > 0 || prefs.travelerType != null)
    ? getRecommendedTemplates(ITINERARY_TEMPLATES, prefs.interests, prefs.travelerType)
    : [];
  const forYouKeys = new Set(forYou.map((t) => t.key));

  const recommended =
    tripLength != null
      ? ITINERARY_TEMPLATES.filter(
          (t) => isRecommendedForTrip(t, tripLength) && !forYouKeys.has(t.key)
        )
      : [];
  const others =
    tripLength != null && (recommended.length > 0 || forYou.length > 0)
      ? ITINERARY_TEMPLATES.filter(
          (t) => !isRecommendedForTrip(t, tripLength) && !forYouKeys.has(t.key)
        )
      : ITINERARY_TEMPLATES.filter((t) => !forYouKeys.has(t.key));

  useEffect(() => {
    if (tripLength == null) return;
    track("trip_length_recommendation_shown", {
      trip_length: tripLength,
      recommended_count: recommended.length,
      for_you_count: forYou.length,
    });
  }, [tripLength, recommended.length, forYou.length]);

  const templateCardClass = "shrink-0 snap-center w-[85vw] max-w-[280px] sm:w-full sm:max-w-none";
  const renderTemplateCard = (
    template: (typeof ITINERARY_TEMPLATES)[number],
    isRecommended: boolean,
    isForYou: boolean
  ) => {
    const placeCount = Object.values(template.days).flat().length;
    const preview = (() => {
      const ids = Object.values(template.days).flat();
      const names = ids.slice(0, 4).map((id) => getPlace(id)?.name ?? id).join(", ");
      return ids.length > 4 ? `${names}…` : names;
    })();
    return (
      <button
        key={template.key}
        type="button"
        onClick={() => onTemplateClick(template.key)}
        className={`text-left w-full min-h-[96px] sm:min-h-[104px] ${CARD.planTemplate} ${CARD.interactive} p-5 sm:p-6 transition-all duration-200 ease-out active:scale-[0.99] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background group ${
          isForYou ? "border-l-4 border-l-terracotta bg-terracotta/[0.04]" : ""
        } ${isRecommended && !isForYou ? "border-l-4 border-l-aegean bg-aegean/[0.04]" : ""}`}
        aria-label={`Use ${template.label} template: ${template.description}. ${template.duration} days, ${placeCount} places. ${preview}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className={`${TYPE.cardTitle} block break-words`}>
              {template.label}
            </span>
            {isForYou && (
              <span className="text-xs font-medium text-terracotta mt-1 block uppercase tracking-wider">
                {tPlanQuick("forYou")}
              </span>
            )}
            {!isForYou && isRecommended && tripLength != null && (
              <span className="text-xs font-medium text-aegean mt-1 block">{tPlanQuick("fitsTripLength", { days: tripLength })}</span>
            )}
          </div>
          <span
            className="shrink-0 rounded-lg bg-sand-200/80 px-2.5 py-1 text-xs font-semibold text-olive/80 tabular-nums"
            aria-hidden
          >
            {template.duration}d
          </span>
        </div>
        <span className="text-sm text-olive/70 mt-2 block break-words line-clamp-2 leading-relaxed">{template.description}</span>
        {tripLength != null && (
          <span className="mt-2 inline-flex rounded-md bg-sand-100 px-2 py-1 text-xs font-medium text-olive/70">
            {tPlanQuick(getTripFitKey(template.duration, tripLength))}
          </span>
        )}
      </button>
    );
  };

  return (
    <section aria-labelledby="quick-start-heading" className="space-y-8 sm:space-y-10">
      <header>
        <span
          className="inline-flex items-center min-h-[28px] px-2.5 rounded-lg bg-aegean/10 text-aegean text-xs font-semibold uppercase tracking-wider"
          aria-hidden
        >
          {hasContent ? tPlanQuick("kickerHasContent") : tPlanQuick("kickerEmpty")}
        </span>
        <h2
          id="quick-start-heading"
          className="font-display text-2xl sm:text-3xl font-semibold text-olive tracking-tight mt-3 mb-2"
        >
          {hasContent ? tPlanQuick("titleHasContent") : tPlanQuick("titleEmpty")}
        </h2>
        <p className="text-sm text-olive/70 max-w-xl leading-relaxed">
          {hasContent ? tPlanQuick("descHasContent") : tPlanQuick("descEmpty")}
        </p>
        {!hasContent && tripLength == null && (
          <p className="text-sm text-olive/60 max-w-xl mt-2">
            {tPlanQuick("setDatesHint")}
          </p>
        )}
        {tripLength != null && (
          <div className="mt-3 rounded-xl border border-aegean/20 bg-aegean/5 p-3 sm:p-4">
            <p className="text-sm text-olive/85">
              {tPlanQuick("recommendedForTrip", { days: tripLength })}
            </p>
          </div>
        )}
      </header>

      {!hasContent && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-olive/80">
            {tPlanQuick("quickAddLabel", { day: activeDay })}
          </p>
          <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [-webkit-overflow-scrolling:touch] overscroll-x-contain min-h-[44px] items-center touch-pan-x">
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
                  className={`shrink-0 snap-start transition-colors duration-200 ${PILL.base} ${inDay ? "bg-sand-200/80 text-olive/50 cursor-default" : PILL.neutral} disabled:active:scale-100`}
                  aria-pressed={inDay}
                  aria-label={
                    inDay
                      ? tPlanQuick("quickAddAriaAdded", { label })
                      : tPlanQuick("quickAddAriaAdd", { label, day: activeDay })
                  }
                >
                  {inDay ? `${tPlanQuick("quickAddAriaAdded", { label })} ` : ""}
                  {label}
                </button>
              );
            })}
            <AppLink
              href="/discover"
              className={`shrink-0 snap-start ${PILL.base} ${PILL.neutral}`}
              aria-label={tPlanQuick("browsePlacesAria")}
            >
              {tPlanQuick("browsePlacesCta")}
            </AppLink>
            <AppLink
              href="/trails"
              className={`shrink-0 snap-start ${PILL.base} ${PILL.neutral}`}
              aria-label={tPlanQuick("browseTrailsAria")}
            >
              {tPlanQuick("browseTrailsLabel")}
            </AppLink>
            <AppLink
              href="/discover?filter=winery"
              className={`shrink-0 snap-start ${PILL.base} ${PILL.neutral}`}
              aria-label={tPlanQuick("browseWineriesAria")}
            >
              {tPlanQuick("browseWineriesLabel")}
            </AppLink>
            <AppLink
              href="/events"
              className={`shrink-0 snap-start ${PILL.base} ${PILL.neutral}`}
              aria-label={tPlanQuick("seeWhatsOnAria")}
            >
              {tPlanQuick("seeWhatsOnLabel")}
            </AppLink>
          </div>
        </div>
      )}

      <div className="space-y-8 sm:space-y-10">
        {forYou.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-terracotta uppercase tracking-wider">
              {tPlanQuick("forYou")}
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [-webkit-overflow-scrolling:touch] overscroll-x-contain touch-pan-x sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 lg:gap-6 sm:overflow-visible">
              {forYou.map((template) => (
                <div key={template.key} className={templateCardClass}>
                  {renderTemplateCard(template, false, true)}
                </div>
              ))}
            </div>
          </div>
        )}
        {recommended.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-aegean uppercase tracking-wider">
              {tripLength != null ? tPlanQuick("forTrip", { days: tripLength }) : tPlanQuick("forYou")}
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [-webkit-overflow-scrolling:touch] overscroll-x-contain touch-pan-x sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 lg:gap-6 sm:overflow-visible">
              {recommended.map((template) => (
                <div key={template.key} className={templateCardClass}>
                  {renderTemplateCard(template, true, false)}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-olive/70 uppercase tracking-wider">
            {tPlanQuick("kickerEmpty")}
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [-webkit-overflow-scrolling:touch] overscroll-x-contain touch-pan-x sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 lg:gap-6 sm:overflow-visible">
            {others.map((template) => (
              <div key={template.key} className={templateCardClass}>
                {renderTemplateCard(template, false, false)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
