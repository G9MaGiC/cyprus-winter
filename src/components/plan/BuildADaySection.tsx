"use client";

import AppLink from "@/components/AppLink";
import { CARD, CTA, HOME, SECTION, TYPE } from "@/lib/design-tokens";
import { getRelatedPlaces } from "@/lib/related-places";
import { DAY_COMBO_DEFS } from "@/data/day-combos";
import type { RelatedPlace } from "@/lib/related-places";
import { useTranslations } from "next-intl";

function typeBadge(type: RelatedPlace["type"], label: string) {
  const cls: Record<RelatedPlace["type"], string> = {
    trail: "bg-sage/15 text-sage",
    winery: "bg-golden/15 text-golden",
    attraction: "bg-aegean/15 text-aegean",
    restaurant: "bg-sand-200/80 text-muted-ink",
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
  readOnly?: boolean;
};

export default function BuildADaySection({ hasContent, onComboClick, readOnly = false }: BuildADaySectionProps) {
  const tPlan = useTranslations("plan");
  const tCombos = useTranslations("plan.dayCombos");
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
        <h2 id="build-a-day-heading" className={`mt-3 ${TYPE.sectionTitle} text-olive ${SECTION.titleGap}`}>
          {tPlan("buildADay")}
        </h2>
        <p className="text-sm text-muted-ink max-w-xl leading-relaxed">
          {tPlan("curatedCombosDesc")}
        </p>
      </header>
      <div className={`grid sm:grid-cols-2 lg:grid-cols-3 ${HOME.gridGap}`}>
        {DAY_COMBO_DEFS.map((combo) => {
          const places = getRelatedPlaces(combo.ids);
          if (places.length === 0) return null;
          const addIds = places.map((p) => p.id).join(",");
          const label = tCombos(`${combo.key}.label`);
          const why = tCombos(`${combo.key}.why`);
          const tipKeysWithTip: Record<string, true> = {
            trailAndVillage: true,
            paphosMosaicsWine: true,
            waterfallVillage: true,
            kykkosWine: true,
            gentleTrailPlatres: true,
          };
          const tip = tipKeysWithTip[combo.key] ? tCombos(`${combo.key}.tip`) : "";
          return (
            <article
              key={combo.key}
              className={`${CARD.planCombo} ${CARD.interactive} p-5 sm:p-6 flex flex-col group transition-all duration-200`}
            >
              <h3 className={`${TYPE.cardTitle} text-base sm:text-lg mb-2`}>
                {label}
              </h3>
              <p className={`text-sm text-muted-ink mb-3 leading-relaxed`}>
                {why}
              </p>
              {tip && tip !== `${combo.key}.tip` && (
                <p className={`text-xs text-muted-ink ${SECTION.headingGap} italic border-s-2 border-s-golden/40 ps-3`}>
                  {tip}
                </p>
              )}
              <div className={`flex items-center gap-1.5 text-xs text-muted-ink ${SECTION.headingGap} uppercase tracking-wider`} aria-hidden>
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
                  onClick={() => onComboClick(places.map((p) => p.id), label)}
                  disabled={readOnly}
                  className={`w-full ${CTA.primaryCompact} transition-transform duration-150 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-label={tPlan("aria.addCombo", { label })}
                >
                  {tPlan("addToPlan")}
                </button>
              ) : readOnly ? (
                <button
                  type="button"
                  disabled
                  className={`w-full ${CTA.primaryCompact} opacity-50 cursor-not-allowed`}
                  aria-label={tPlan("aria.addCombo", { label })}
                >
                  {tPlan("addToPlan")}
                </button>
              ) : (
                <AppLink
                  href={`/plan?add=${addIds}`}
                  className={`w-full ${CTA.primaryCompact} transition-transform duration-150 active:scale-[0.98] motion-reduce:active:scale-100 block text-center`}
                  aria-label={tPlan("aria.addCombo", { label })}
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
