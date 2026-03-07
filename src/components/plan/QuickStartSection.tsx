"use client";

import Link from "next/link";
import { CARD, SECTION, TYPE, PILL } from "@/lib/design-tokens";
import { ITINERARY_TEMPLATES, type TemplateKey } from "@/data/itinerary-templates";
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

function getPreviewSnippet(template: (typeof ITINERARY_TEMPLATES)[number], getPlace: (id: string) => PlanItem | undefined): string {
  const dayKeys = Object.keys(template.days)
    .map(Number)
    .sort((a, b) => a - b)
    .slice(0, 3);
  const parts: string[] = [];
  for (const d of dayKeys) {
    const ids = template.days[d] ?? [];
    const names = ids.map((id) => getPlace(id)?.name).filter(Boolean) as string[];
    if (names.length > 0) parts.push(`Day ${d}: ${names.slice(0, 2).join(", ")}`);
  }
  return parts.length > 0 ? parts.join(" · ") : "";
}

const QUICK_ADD_PLACES = [
  { id: "artemis", label: "Artemis Trail" },
  { id: "kourion", label: "Kourion" },
  { id: "domes-sergiou", label: "Dómes Sergiou" },
  { id: "omodos", label: "Omodos" },
];

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
    const preview = getPreviewSnippet(template, getPlace);
    return (
      <button
        key={template.key}
        type="button"
        onClick={() => onTemplateClick(template.key)}
        className={`text-left min-h-[88px] ${CARD.base} ${CARD.content} ${CARD.hover} ${CARD.interactive} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background group ${
          isRecommended ? "border-aegean/30 bg-aegean/5" : ""
        }`}
        aria-label={`Use ${template.label} template: ${template.description}. ${template.duration} days, ${placeCount} places.`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="font-display font-semibold text-olive block break-words group-hover:text-terracotta transition-colors">
              {template.label}
            </span>
            {isRecommended && (
              <span className="text-xs text-aegean font-medium mt-0.5 block">Best match for your {tripLength}-day trip</span>
            )}
          </div>
          <span
            className="shrink-0 rounded-md bg-aegean/15 px-2 py-0.5 text-xs font-medium text-aegean tabular-nums"
            aria-hidden
          >
            {template.duration}d
          </span>
        </div>
        <span className="text-xs text-olive/60 mt-0.5 block break-words">{template.description}</span>
        {preview && (
          <span className="text-xs text-olive/50 mt-1 block line-clamp-2" title={preview}>
            {preview}
          </span>
        )}
        {template.seasonalNote && (
          <span className="text-xs text-sage mt-1 block">{template.seasonalNote}</span>
        )}
      </button>
    );
  };

  return (
    <section aria-labelledby="quick-start-heading">
      <h2 id="quick-start-heading" className={`${TYPE.sectionTitle} ${SECTION.titleGap}`}>
        Start here
      </h2>
      <p className={`text-sm text-olive/60 max-w-xl break-words ${SECTION.headingGap}`}>
        {hasContent
          ? "Add more places or swap templates. Saves as you go."
          : "Pick a template or add one place. Kourion, Artemis, Omodos—start wherever feels right."}
      </p>

      {!hasContent && (
        <div className="mb-6 sm:mb-8">
          <span className={`${TYPE.kicker} block mb-2`}>Add to Day {activeDay}</span>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {QUICK_ADD_PLACES.map(({ id, label }) => {
              const inDay = activeDayItems.includes(id);
              const place = getPlace(id);
              if (!place) return null;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => addToDay(id)}
                  disabled={inDay}
                  className={`${PILL.base} ${inDay ? "bg-sand-200/80 text-olive/50 cursor-default" : PILL.neutral} disabled:active:scale-100`}
                  aria-pressed={inDay}
                  aria-label={inDay ? `${label} added` : `Add ${label} to Day ${activeDay}`}
                >
                  {inDay ? "✓ " : ""}
                  {label}
                </button>
              );
            })}
            <Link href="/discover" className={`${PILL.base} ${PILL.neutral}`}>
              Discover
            </Link>
            <Link href="/trails" className={`${PILL.base} ${PILL.neutral}`}>
              Trails
            </Link>
            <Link href="/discover?filter=winery" className={`${PILL.base} ${PILL.neutral}`}>
              Wineries
            </Link>
            <Link href="/events" className={`${PILL.base} ${PILL.neutral}`}>
              What&apos;s on
            </Link>
          </div>
        </div>
      )}

      <div>
        {recommended.length > 0 && (
          <div className="mb-8">
            <span className={`${TYPE.kicker} block mb-2`}>Recommended for your {tripLength}-day trip</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {recommended.map((template) => renderTemplateCard(template, true))}
            </div>
          </div>
        )}
        <span className={`${TYPE.kicker} block mb-2`}>
          {recommended.length > 0 ? "Other itineraries" : "Pre-built itineraries"}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {others.map((template) => renderTemplateCard(template, false))}
        </div>
      </div>
    </section>
  );
}
