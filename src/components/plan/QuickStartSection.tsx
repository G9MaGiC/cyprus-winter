"use client";

import Link from "next/link";
import { CARD, SECTION, TYPE, PILL } from "@/lib/design-tokens";
import { ITINERARY_TEMPLATES, type TemplateKey } from "@/data/itinerary-templates";
import { PLAN_QUICK_ADD_PLACES } from "@/data/plan-quick-add";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { getRecommendedTemplates } from "@/lib/personalization";
import type { PlanItem } from "@/data";

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

export default function QuickStartSection({
  activeDay,
  days,
  getPlace,
  addToDay,
  onTemplateClick,
  hasContent,
  tripLength,
}: QuickStartSectionProps) {
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
        className={`text-left min-h-[88px] sm:min-h-[96px] ${CARD.planTemplate} ${CARD.interactive} p-5 sm:p-6 transition-all duration-200 ease-out active:scale-[0.99] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background group ${
          isForYou ? "border-terracotta/25 bg-terracotta/5" : isRecommended ? "border-aegean/30 bg-aegean/5" : ""
        }`}
        aria-label={`Use ${template.label} template: ${template.description}. ${template.duration} days, ${placeCount} places. ${preview}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className={`${TYPE.cardTitle} block break-words`}>
              {template.label}
            </span>
            {isForYou && (
              <span className="text-sm text-terracotta font-medium mt-0.5 block">For you</span>
            )}
            {!isForYou && isRecommended && (
              <span className="text-sm text-aegean font-medium mt-0.5 block">Best fit for {tripLength} days</span>
            )}
          </div>
          <span
            className="shrink-0 rounded-md bg-aegean/15 px-2 py-0.5 text-xs font-medium text-aegean tabular-nums"
            aria-hidden
          >
            {template.duration}d
          </span>
        </div>
        <span className="text-sm text-olive/70 mt-0.5 block break-words line-clamp-2 leading-relaxed">{template.description}</span>
      </button>
    );
  };

  return (
    <section aria-labelledby="quick-start-heading" className={`${SECTION.pySub} px-5 sm:px-6 rounded-2xl ${SECTION.alt}`}>
      <div className="space-y-6 sm:space-y-8">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-flex items-center min-h-[28px] px-2.5 rounded-md bg-aegean/10 text-aegean text-xs font-semibold uppercase tracking-wider"
            aria-hidden
          >
            Templates & quick add
          </span>
        </div>
        <h2 id="quick-start-heading" className={`font-display text-xl sm:text-2xl font-semibold text-olive tracking-tight mb-1`}>
          Start here
        </h2>
        <p className={`text-sm text-olive/70 max-w-xl break-words leading-relaxed ${SECTION.headingGap}`}>
          {hasContent ? "Add more or swap templates." : "Pick a template or add places."}
        </p>
        {!hasContent && tripLength == null && (
          <p className="text-sm text-olive/60 max-w-xl break-words mt-1 mb-4">
            Set your dates above to see templates that match your trip length.
          </p>
        )}
      </header>

      {!hasContent && (
        <div className="space-y-3">
          <span className="text-xs font-semibold text-olive/70 uppercase tracking-wider block">Day {activeDay}</span>
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
                  aria-label={inDay ? `${label} added` : `Add ${label} to Day ${activeDay}`}
                >
                  {inDay ? "✓ " : ""}
                  {label}
                </button>
              );
            })}
            <Link href="/discover" className={`shrink-0 snap-start ${PILL.base} ${PILL.neutral}`}>
              Discover
            </Link>
            <Link href="/trails" className={`shrink-0 snap-start ${PILL.base} ${PILL.neutral}`}>
              Trails
            </Link>
            <Link href="/discover?filter=winery" className={`shrink-0 snap-start ${PILL.base} ${PILL.neutral}`}>
              Wineries
            </Link>
            <Link href="/events" className={`shrink-0 snap-start ${PILL.base} ${PILL.neutral}`}>
              What&apos;s on
            </Link>
          </div>
        </div>
      )}

      <div className="space-y-6 sm:space-y-8">
        {forYou.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <span className="text-xs font-semibold text-terracotta uppercase tracking-wider block">For you</span>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 sm:overflow-visible sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [-webkit-overflow-scrolling:touch] overscroll-x-contain">
              {forYou.map((template) => (
                <div key={template.key} className="shrink-0 w-[88vw] max-w-[320px] sm:w-auto sm:max-w-none sm:shrink sm:min-w-0">
                  {renderTemplateCard(template, false, true)}
                </div>
              ))}
            </div>
          </div>
        )}
        {recommended.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <span className="text-xs font-semibold text-aegean uppercase tracking-wider block">For your {tripLength}-day trip</span>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 sm:overflow-visible sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [-webkit-overflow-scrolling:touch] overscroll-x-contain">
              {recommended.map((template) => (
                <div key={template.key} className="shrink-0 w-[88vw] max-w-[320px] sm:w-auto sm:max-w-none sm:shrink sm:min-w-0">
                  {renderTemplateCard(template, true, false)}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-3 sm:space-y-4">
          <span className="text-xs font-semibold text-olive/70 uppercase tracking-wider block">
            {recommended.length > 0 || forYou.length > 0 ? "Other templates" : "Templates"}
          </span>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 sm:overflow-visible sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [-webkit-overflow-scrolling:touch] overscroll-x-contain">
          {others.map((template) => (
            <div key={template.key} className="shrink-0 w-[88vw] max-w-[320px] sm:w-auto sm:max-w-none sm:shrink sm:min-w-0">
              {renderTemplateCard(template, false, false)}
            </div>
          ))}
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
