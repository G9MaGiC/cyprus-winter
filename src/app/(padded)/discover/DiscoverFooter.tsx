"use client";

import AppLink from "@/components/AppLink";
import { OPEN_AI_EVENT } from "@/components/AIAssistantTrigger";
import { SECTION, CTA, LAYOUT } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

type DiscoverFooterProps = {
  onScrollToMap?: () => void;
};

export default function DiscoverFooter({ onScrollToMap }: DiscoverFooterProps) {
  const tDiscover = useTranslations("discover");
  return (
    <footer
      className={`${SECTION.footerBlock} pt-14 sm:pt-16 pb-8 sm:pb-12 ${LAYOUT.footerBottomClearance} text-center`}
      aria-label={tDiscover("aria.actions")}
    >
      <p
        className={`text-sm text-olive/70 ${SECTION.headingGap} max-w-md mx-auto leading-relaxed`}
      >
        {tDiscover("footer.body")}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <AppLink href="/plan" className={CTA.primaryCompact}>
          {tDiscover("footer.addToPlan")}
        </AppLink>
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new CustomEvent(OPEN_AI_EVENT))
          }
          className={CTA.secondaryCompact}
          aria-label={tDiscover("aria.askAi")}
        >
          {tDiscover("footer.askAi")}
        </button>
        {onScrollToMap && (
          <button
            type="button"
            onClick={onScrollToMap}
            className={`text-sm font-medium ${SECTION.aegeanLink}`}
            aria-label={tDiscover("aria.scrollToMap")}
          >
            {tDiscover("footer.seeMap")}
          </button>
        )}
      </div>
    </footer>
  );
}
