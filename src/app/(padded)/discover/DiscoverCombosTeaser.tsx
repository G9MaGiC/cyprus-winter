"use client";

import AppLink from "@/components/AppLink";
import { DAY_COMBO_DEFS } from "@/data/day-combos";
import { getRelatedPlaces } from "@/lib/related-places";
import { CARD, CTA, SECTION, TYPE } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

const TEASER_KEYS = DAY_COMBO_DEFS.slice(0, 3);

/** Surfaces curated day pairings on Discover (P2-04). */
export default function DiscoverCombosTeaser() {
  const tDiscover = useTranslations("discover.page.combosTeaser");
  const tCombos = useTranslations("plan.dayCombos");
  const tPlan = useTranslations("plan");

  return (
    <section
      aria-labelledby="discover-combos-teaser-heading"
      className={`${CARD.base} ${CARD.contentLg} border-s-4 border-s-golden/40`}
    >
      <span className={`${TYPE.kicker} text-golden-ink`}>{tDiscover("kicker")}</span>
      <h2 id="discover-combos-teaser-heading" className={`${TYPE.sectionTitle} text-olive mt-2 ${SECTION.titleGap}`}>
        {tDiscover("title")}
      </h2>
      <p className="text-sm text-muted-ink max-w-xl leading-relaxed mb-6">{tDiscover("body")}</p>
      <ul className="grid gap-4 sm:grid-cols-3 mb-6">
        {TEASER_KEYS.map((combo) => {
          const places = getRelatedPlaces(combo.ids);
          const addIds = places.map((p) => p.id).join(",");
          const label = tCombos(`${combo.key}.label`);
          return (
            <li key={combo.key} className="rounded-xl border border-sand-200/80 bg-sand-100/40 p-4 flex flex-col">
              <h3 className={`${TYPE.cardTitle} text-base mb-1`}>{label}</h3>
              <p className="text-xs text-muted-ink line-clamp-2 flex-1">{tCombos(`${combo.key}.why`)}</p>
              <AppLink
                href={`/plan?add=${addIds}`}
                className={`mt-3 ${CTA.secondaryCompact} text-center text-sm`}
              >
                {tPlan("addToPlan")}
              </AppLink>
            </li>
          );
        })}
      </ul>
      <AppLink href="/plan#build-a-day-heading" className={SECTION.aegeanLink}>
        {tDiscover("seeAll")}
      </AppLink>
    </section>
  );
}
