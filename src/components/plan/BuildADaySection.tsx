"use client";

import AppLink from "@/components/AppLink";
import { CARD, CTA, TYPE } from "@/lib/design-tokens";
import { getRelatedPlaces } from "@/lib/related-places";
import { DAY_COMBOS } from "@/data/day-combos";
import type { RelatedPlace } from "@/lib/related-places";
import { useTranslations } from "next-intl";

function typeBadge(type: RelatedPlace["type"], label: string) {
  const cls: Record<RelatedPlace["type"], string> = {
    trail: "bg-sage/15 text-sage",
    winery: "bg-golden/15 text-golden",
    attraction: "bg-aegean/15 text-aegean",
    restaurant: "bg-sand-200/80 text-olive/80",
    event: "bg-olive/10 text-olive",
  };
  return (
    <span
      className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-medium uppercase tracking-wider ${cls[type]}`}
      aria-hidden
    >
      {label}
    </span>
  );
}

type BuildADaySectionProps = {
  hasContent: boolean;
  onComboClick?: (ids: string[], label: string) => void;
};

export default function BuildADaySection({ hasContent, onComboClick }: BuildADaySectionProps) {
  const tPlan = useTranslations("plan");
  const tCommon = useTranslations("common");

  const typeLabels: Record<RelatedPlace["type"], string> = {
    trail: tCommon("trail"),
    winery: tCommon("winery"),
    attraction: tCommon("place"),
    restaurant: tCommon("eat"),
    event: tCommon("event"),
  };

  return (
    <section
      aria-labelledby="build-a-day-heading"
      className="space-y-6 sm:space-y-8"
    >
      <header>
        <span
          id="build-a-day-kicker"
          className="inline-flex items-center min-h-[28px] px-2.5 rounded-lg bg-golden/15 text-golden text-xs font-semibold uppercase tracking-wider"
          aria-hidden
        >
          {tPlan("curatedCombos")}
        </span>
        <h2 id="build-a-day-heading" className="font-display text-2xl sm:text-3xl font-semibold text-olive tracking-tight mt-3 mb-2">
          {tPlan("buildADay")}
        </h2>
        <p className="text-sm text-olive/70 max-w-xl leading-relaxed">
          {tPlan("curatedCombosDesc")}
        </p>
      </header>
      <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {DAY_COMBOS.map((combo) => {
          const places = getRelatedPlaces(combo.ids);
          if (places.length === 0) return null;
          const addIds = places.map((p) => p.id).join(",");
          return (
            <article
              key={combo.label}
              className={`${CARD.planCombo} ${CARD.interactive} p-5 sm:p-6 flex flex-col group transition-all duration-200`}
            >
              <h3 className={`${TYPE.cardTitle} text-base sm:text-lg mb-2`}>
                {combo.label}
              </h3>
              <p className={`text-sm text-olive/70 mb-3 leading-relaxed`}>
                {combo.why}
              </p>
              {combo.tip && (
                <p className="text-xs text-olive/60 mb-4 italic border-l-2 border-l-golden/40 pl-3">
                  {combo.tip}
                </p>
              )}
              <div className="flex items-center gap-1.5 text-xs text-olive/50 mb-4 uppercase tracking-wider" aria-hidden>
                <span>{tPlan("morning")}</span>
                <span aria-hidden>→</span>
                <span>{tPlan("afternoon")}</span>
              </div>
              <ul className="space-y-2.5 mb-5 flex-1 min-h-0">
                {places.map((p) => (
                  <li key={p.id} className="flex items-center gap-2 min-w-0">
                    {typeBadge(p.type, typeLabels[p.type])}
                    <AppLink
                      href={p.href}
                      className="min-w-0 flex-1 break-words text-sm text-olive/90 hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded min-h-[44px] flex items-center py-1 -my-1"
                    >
                      {p.name}
                    </AppLink>
                  </li>
                ))}
              </ul>
              {hasContent && onComboClick ? (
                <button
                  type="button"
                  onClick={() => onComboClick(places.map((p) => p.id), combo.label)}
                  className={`w-full ${CTA.primaryCompact} transition-transform duration-150 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
                  aria-label={tPlan("aria.addCombo", { label: combo.label })}
                >
                  {tPlan("addToPlan")}
                </button>
              ) : (
                <AppLink
                  href={`/plan?add=${addIds}`}
                  className={`w-full ${CTA.primaryCompact} transition-transform duration-150 active:scale-[0.98] motion-reduce:active:scale-100 block text-center`}
                  aria-label={tPlan("aria.addCombo", { label: combo.label })}
                >
                  {tPlan("addToPlan")}
                </AppLink>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
