"use client";

import AppLink from "@/components/AppLink";
import { OPEN_AI_EVENT } from "@/components/AIAssistantTrigger";
import { SECTION, CTA, LAYOUT } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

type TrailsFooterProps = {
  reportTrailId?: string | null;
  onScrollToMap?: () => void;
};

export default function TrailsFooter({ reportTrailId, onScrollToMap }: TrailsFooterProps = {}) {
  const tCommon = useTranslations("common");
  const tTrails = useTranslations("trails");
  return (
    <footer
      className={`${SECTION.footerBlock} pt-14 sm:pt-16 pb-8 sm:pb-12 ${LAYOUT.footerBottomClearance} text-center`}
      aria-label={tTrails("aria.actions")}
    >
      <p
        className={`text-sm text-olive/70 ${SECTION.headingGap} max-w-md mx-auto leading-relaxed`}
      >
        {tCommon("trailsFooterDisclaimer")}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <AppLink href="/plan" className={CTA.primaryCompact}>
          {tCommon("planYourTrip")}
        </AppLink>
        <AppLink
          href={reportTrailId ? `/trails/${reportTrailId}/report` : "/trails"}
          className={CTA.secondaryCompact}
          aria-label={tTrails("aria.reportConditions")}
        >
          {tCommon("reportConditions")}
        </AppLink>
        <AppLink
          href="/guides/troodos-december"
          className={`text-sm font-medium ${SECTION.aegeanLink}`}
        >
          {tCommon("winterHikingGuide")}
        </AppLink>
        <a
          href="tel:112"
          className={`text-sm font-medium ${SECTION.aegeanLink}`}
        >
          {tCommon("emergency112")}
        </a>
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new CustomEvent(OPEN_AI_EVENT))
          }
          className={`text-sm font-medium ${SECTION.aegeanLink}`}
          aria-label={tCommon("askAITrailsAria")}
        >
          {tCommon("askAI")}
        </button>
      </div>
      {onScrollToMap && (
        <button
          type="button"
          onClick={onScrollToMap}
          className={`text-sm ${SECTION.aegeanLink} mt-4 inline-block`}
          aria-label={tTrails("aria.scrollToMap")}
        >
          {tCommon("seeMap")}
        </button>
      )}
    </footer>
  );
}
