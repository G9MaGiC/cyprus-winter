"use client";

import AppLink from "@/components/AppLink";
import HubFooter from "@/components/HubFooter";
import { SECTION } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

type TrailsFooterProps = {
  reportTrailId?: string | null;
  onScrollToMap?: () => void;
};

export default function TrailsFooter({ reportTrailId, onScrollToMap }: TrailsFooterProps = {}) {
  const tCommon = useTranslations("common");
  const tTrails = useTranslations("trails");

  return (
    <HubFooter
      body={tCommon("trailsFooterDisclaimer")}
      ariaLabel={tTrails("aria.actions")}
      onScrollToMap={onScrollToMap}
      scrollToMapLabel={onScrollToMap ? tCommon("seeMap") : undefined}
      scrollToMapAriaLabel={tTrails("aria.scrollToMap")}
      secondary={
        <div className="flex flex-wrap items-center justify-center gap-3">
          <AppLink
            href={reportTrailId ? `/trails/${reportTrailId}/report` : "/trails"}
            className={`text-sm font-medium ${SECTION.aegeanLink}`}
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
          <a href="tel:112" className={`text-sm font-medium ${SECTION.aegeanLink}`}>
            {tCommon("emergency112")}
          </a>
        </div>
      }
    />
  );
}
