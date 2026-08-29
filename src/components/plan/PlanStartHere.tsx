"use client";

import { CARD, CTA, TYPE, SECTION } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

type PlanStartHereProps = {
  onJumpToTonight: () => void;
  onAddFirstStop: () => void;
};

export default function PlanStartHere({ onJumpToTonight, onAddFirstStop }: PlanStartHereProps) {
  const t = useTranslations("plan.startHere");

  return (
    <section
      className={`${CARD.info} border-s-4 border-s-aegean ${CARD.content} ${SECTION.headingGap}`}
      aria-labelledby="plan-start-here-title"
    >
      <p className={`${TYPE.kicker} ${SECTION.titleGap}`}>{t("kicker")}</p>
      <h2 id="plan-start-here-title" className={`${TYPE.subSectionTitle} text-olive ${SECTION.titleGap}`}>
        {t("title")}
      </h2>
      <p className={`text-sm text-olive/80 leading-relaxed ${SECTION.headingGap}`}>{t("framing")}</p>
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <button type="button" onClick={onJumpToTonight} className={CTA.primaryCompact}>
          {t("tonightCta")}
        </button>
        <button type="button" onClick={onAddFirstStop} className={CTA.secondaryCompact}>
          {t("addStopCta")}
        </button>
      </div>
    </section>
  );
}
