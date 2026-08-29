"use client";

import AppLink from "@/components/AppLink";
import Disclosure from "@/components/Disclosure";
import { winterTipsHiking } from "@/data/winter-tips";
import { SECTION, TYPE } from "@/lib/design-tokens";
import type { Trail } from "@/data/trails";
import { useTranslations } from "next-intl";

type TrailsTipsSectionProps = {
  /** First trail for report link; used when no unknown trails */
  reportTrail: Trail | null;
};

export default function TrailsTipsSection({ reportTrail }: TrailsTipsSectionProps) {
  const t = useTranslations("trails.tips");
  const tHome = useTranslations("home");

  return (
    <section aria-labelledby="tips-heading" className={`${SECTION.pySub} border-t border-sand-200/80`}>
      <Disclosure id="tips-heading" summary={t("summary")} defaultOpen={false}>
        <div className="rounded-xl bg-sand-100/80 border border-sand-200/80 p-4 sm:p-6 border-s-4 border-s-sage/50">
          <p className={`text-xs text-olive/60 ${SECTION.headingGap} break-words italic`}>
            {t("disclaimer")}
          </p>
          <p className={`text-sm text-olive/80 break-words`}>
            {t("shortChecklist")}
          </p>
          <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-sand-200/80 gap-4">
            {winterTipsHiking.slice(0, 4).map((tip) => (
              <div
                key={tip.id}
                className="py-3 sm:py-0 sm:px-6 first:pt-0 last:pb-0 sm:first:ps-0 sm:last:pe-0"
              >
                <h3 className={`${TYPE.kicker} text-olive`}>
                  {tHome(`insiderTips.${tip.id}.title`)}
                </h3>
                <p className="text-sm text-olive/80 mt-1 leading-relaxed break-words">
                  {tHome(`insiderTips.${tip.id}.body`)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-sand-200/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <AppLink
                href="/plan"
                className="inline-flex items-center min-h-[44px] py-2 text-sm font-medium text-terracotta hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
              >
                {t("addToPlan")}
              </AppLink>
              {reportTrail && (
                <AppLink
                  href={`/trails/${reportTrail.id}/report`}
                  className={`text-sm font-medium ${SECTION.aegeanLink}`}
                >
                  {t("reportConditions")}
                </AppLink>
              )}
            </div>
            <p className="text-xs text-olive/60">
              {t("buildDayHint")}
            </p>
            <AppLink href="/guides/troodos-december" className={`text-sm ${SECTION.aegeanLink}`}>
              {t("troodosGuide")}
            </AppLink>
          </div>
        </div>
      </Disclosure>
    </section>
  );
}
