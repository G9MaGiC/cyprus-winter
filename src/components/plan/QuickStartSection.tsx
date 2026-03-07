"use client";

import Link from "next/link";
import { CARD, SECTION, TYPE, PILL } from "@/lib/design-tokens";
import { WINTER_TEMPLATES } from "@/hooks/useItinerary";
import type { PlanItem } from "@/data";

function getTemplateScope(key: string): string {
  const t = WINTER_TEMPLATES[key];
  if (!t) return "";
  const dayCount = Object.keys(t).length;
  const placeCount = Object.values(t).flat().length;
  return `${dayCount} days · ${placeCount} places`;
}

const TEMPLATES = [
  { key: "classic" as const, label: "Classic", sub: "Coast, culture, hill villages" },
  { key: "mountain" as const, label: "Mountain", sub: "Troodos trails & stone villages" },
  { key: "coast-culture" as const, label: "Coast & Culture", sub: "Beaches, ruins, wine" },
  { key: "family" as const, label: "Family", sub: "Gentle pace, 2–3 stops a day" },
  { key: "short-stay" as const, label: "Short stay", sub: "48 hours: trail, village, wine" },
] as const;

type TemplateKey = (typeof TEMPLATES)[number]["key"];

type QuickStartSectionProps = {
  activeDay: number;
  days: Record<number, string[]>;
  getPlace: (id: string) => PlanItem | undefined;
  addToDay: (id: string) => void;
  onTemplateClick: (key: TemplateKey) => void;
  hasContent: boolean;
};

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
}: QuickStartSectionProps) {
  const activeDayItems = days[activeDay] ?? [];

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
        <span className={`${TYPE.kicker} block mb-2`}>Pre-built itineraries</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {TEMPLATES.map(({ key, label, sub }) => {
            const scope = getTemplateScope(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => onTemplateClick(key)}
                className={`text-left min-h-[72px] ${CARD.base} ${CARD.content} ${CARD.hover} ${CARD.interactive} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background group`}
              >
                <span className="font-display font-semibold text-olive block break-words group-hover:text-terracotta transition-colors">
                  {label}
                </span>
                <span className="text-xs text-olive/60 mt-0.5 block break-words">{sub}</span>
                {scope && <span className="text-xs text-olive/50 mt-0.5 block tabular-nums">{scope}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
