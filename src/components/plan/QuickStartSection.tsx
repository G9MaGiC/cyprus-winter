"use client";

import Link from "next/link";
import { CARD, SECTION, TYPE, PILL } from "@/lib/design-tokens";
import { ITINERARY_TEMPLATES, type TemplateKey } from "@/data/itinerary-templates";
import { PLAN_QUICK_ADD_PLACES } from "@/data/plan-quick-add";
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

  const recommended =
    tripLength != null
      ? ITINERARY_TEMPLATES.filter((t) => isRecommendedForTrip(t, tripLength))
      : [];
  const others =
    tripLength != null && recommended.length > 0
      ? ITINERARY_TEMPLATES.filter((t) => !isRecommendedForTrip(t, tripLength))
      : ITINERARY_TEMPLATES;

  const renderTemplateCard = (template: (typeof ITINERARY_TEMPLATES)[number], isRecommended: boolean) => {
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
        className={`text-left min-h-[72px] sm:min-h-[88px] ${CARD.base} ${CARD.content} ${CARD.hover} ${CARD.interactive} transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background group ${
          isRecommended ? "border-aegean/30 bg-aegean/5" : ""
        }`}
        aria-label={`Use ${template.label} template: ${template.description}. ${template.duration} days, ${placeCount} places. ${preview}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="font-display font-semibold text-olive block break-words group-hover:text-terracotta transition-colors">
              {template.label}
            </span>
            {isRecommended && (
              <span className="text-xs text-aegean font-medium mt-0.5 block">Best fit for {tripLength} days</span>
            )}
          </div>
          <span
            className="shrink-0 rounded-md bg-aegean/15 px-2 py-0.5 text-xs font-medium text-aegean tabular-nums"
            aria-hidden
          >
            {template.duration}d
          </span>
        </div>
        <span className="text-xs text-olive/70 mt-0.5 block break-words line-clamp-2 leading-relaxed">{template.description}</span>
      </button>
    );
  };

  return (
    <section aria-labelledby="quick-start-heading" className="space-y-6 sm:space-y-8">
      <header>
        <h2 id="quick-start-heading" className={`${TYPE.sectionTitle} ${SECTION.titleGap}`}>
          Start here
        </h2>
        <p className={`text-sm text-olive/70 max-w-xl break-words leading-relaxed ${SECTION.headingGap}`}>
          {hasContent ? "Add more or swap templates." : "Pick a template or add places."}
        </p>
        {!hasContent && tripLength == null && (
          <p className="text-xs text-olive/60 max-w-xl break-words mt-1 mb-4">
            Set your dates above to see templates that match your trip length.
          </p>
        )}
      </header>

      {!hasContent && (
        <div className="space-y-3">
          <span className={`${TYPE.kicker} block`}>Day {activeDay}</span>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [-webkit-overflow-scrolling:touch] min-h-[44px] items-center">
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
        {recommended.length > 0 && (
          <div className="space-y-3">
            <span className={`${TYPE.kicker} block`}>For your {tripLength}-day trip</span>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 sm:overflow-visible sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 snap-x snap-mandatory scrollbar-none [scrollbar-width:none]">
              {recommended.map((template) => (
                <div key={template.key} className="shrink-0 w-[85vw] max-w-[280px] sm:w-auto sm:max-w-none sm:shrink sm:min-w-0">
                  {renderTemplateCard(template, true)}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-3">
          <span className={`${TYPE.kicker} block`}>
            {recommended.length > 0 ? "Other templates" : "Templates"}
          </span>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 sm:overflow-visible sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 snap-x snap-mandatory scrollbar-none [scrollbar-width:none]">
          {others.map((template) => (
            <div key={template.key} className="shrink-0 w-[85vw] max-w-[280px] sm:w-auto sm:max-w-none sm:shrink sm:min-w-0">
              {renderTemplateCard(template, false)}
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
