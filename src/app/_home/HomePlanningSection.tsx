import type { ComponentType } from "react";
import { CARD, LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";
import StickyPlanBar from "@/components/StickyPlanBar";
import { useTranslations } from "next-intl";
import type { LinkProps } from "@/app/_home/types";

type HomePlanningSectionProps = {
  LinkComponent: ComponentType<LinkProps>;
  planSubtitle?: string;
};

export default function HomePlanningSection({
  LinkComponent,
  planSubtitle,
}: HomePlanningSectionProps) {
  const t = useTranslations("home.planning");
  return (
    <section
      id="planning-section"
      aria-labelledby="planning-heading"
      className={`${SECTION.py} bg-background ${LAYOUT.safeAreaX} relative scroll-mt-24`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <h2 id="planning-heading" className="sr-only">
          {t("srTitle")}
        </h2>
        <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
          <LinkComponent
            href="/plan"
            prefetch="auto"
            className={`block rounded-2xl ${CARD.contentLg} min-h-[120px] ${CARD.base} border-l-4 border-l-terracotta ${CARD.hover} ${CARD.link} group`}
          >
<h3 className={`${TYPE.subSectionTitleLg} text-charcoal group-hover:text-terracotta transition-colors`}>
            {t("planTitle")}
          </h3>
            <p className="text-sm sm:text-base text-olive/80 mt-2 leading-relaxed">
              {planSubtitle ?? t("planSubtitle")}
            </p>
          </LinkComponent>
          <LinkComponent
            href="/events"
            prefetch="auto"
            className={`block rounded-2xl ${CARD.contentLg} min-h-[120px] ${CARD.base} border-l-4 border-l-aegean ${CARD.hover} ${CARD.link} group`}
          >
<h3 className={`${TYPE.subSectionTitleLg} text-charcoal group-hover:text-terracotta transition-colors`}>
            {t("eventsTitle")}
          </h3>
            <p className="text-sm sm:text-base text-olive/80 mt-2 leading-relaxed">
              {t("eventsBody")}
            </p>
          </LinkComponent>
        </div>
      </div>
      <StickyPlanBar sentinelId="plan-sentinel" />
    </section>
  );
}
