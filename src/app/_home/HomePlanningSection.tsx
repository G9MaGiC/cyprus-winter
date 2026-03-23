import type { ComponentType } from "react";
import { CARD, LAYOUT, SECTION } from "@/lib/design-tokens";
import StickyPlanBar from "@/components/StickyPlanBar";
import type { LinkProps } from "@/app/_home/types";
import { getTranslations } from "next-intl/server";

type HomePlanningSectionProps = {
  LinkComponent: ComponentType<LinkProps>;
  planSubtitle?: string;
};

const defaultPlanSubtitle = "Build a day or pick a template. Saves as you go.";

export default async function HomePlanningSection({
  LinkComponent,
  planSubtitle = defaultPlanSubtitle,
}: HomePlanningSectionProps) {
  const tHome = await getTranslations("home");
  return (
    <section
      id="planning-section"
      aria-labelledby="planning-heading"
      className={`${SECTION.py} bg-background ${LAYOUT.safeAreaX} relative scroll-mt-24`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <h2 id="planning-heading" className="sr-only">
          {tHome("planning.planTitle")}
        </h2>
        <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
          <LinkComponent
            href="/plan"
            prefetch="auto"
            className={`block rounded-2xl ${CARD.contentLg} min-h-[120px] ${CARD.base} border-l-4 border-l-terracotta ${CARD.hover} ${CARD.link} group`}
          >
            <h3 className="font-display text-xl sm:text-2xl font-semibold text-charcoal group-hover:text-terracotta transition-colors">
              {tHome("planning.planTitle")}
            </h3>
            <p className="text-sm sm:text-base text-olive/80 mt-2 leading-relaxed">
              {planSubtitle}
            </p>
          </LinkComponent>
          <LinkComponent
            href="/events"
            prefetch="auto"
            className={`block rounded-2xl ${CARD.contentLg} min-h-[120px] ${CARD.base} border-l-4 border-l-aegean ${CARD.hover} ${CARD.link} group`}
          >
            <h3 className="font-display text-xl sm:text-2xl font-semibold text-charcoal group-hover:text-terracotta transition-colors">
              {tHome("planning.eventsTitle")}
            </h3>
            <p className="text-sm sm:text-base text-olive/80 mt-2 leading-relaxed">
              {tHome("planning.eventsDesc")}
            </p>
          </LinkComponent>
        </div>
      </div>
      <StickyPlanBar sentinelId="plan-sentinel" />
    </section>
  );
}
