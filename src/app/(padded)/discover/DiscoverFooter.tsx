"use client";

import AppLink from "@/components/AppLink";
import { OPEN_AI_EVENT } from "@/components/AIAssistantTrigger";
import { SECTION, CTA, LAYOUT } from "@/lib/design-tokens";

type DiscoverFooterProps = {
  onScrollToMap?: () => void;
};

export default function DiscoverFooter({ onScrollToMap }: DiscoverFooterProps) {
  return (
    <footer
      className={`${SECTION.footerBlock} pt-14 sm:pt-16 pb-8 sm:pb-12 ${LAYOUT.footerBottomClearance} text-center`}
      aria-label="Discover actions"
    >
      <p
        className={`text-sm text-olive/70 ${SECTION.headingGap} max-w-md mx-auto leading-relaxed`}
      >
        Add places to your plan—or ask the AI. It knows the island in winter.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <AppLink href="/plan" className={CTA.primaryCompact}>
          Add places to your plan
        </AppLink>
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new CustomEvent(OPEN_AI_EVENT))
          }
          className={CTA.secondaryCompact}
          aria-label="Ask AI for trip suggestions"
        >
          Ask AI
        </button>
        {onScrollToMap && (
          <button
            type="button"
            onClick={onScrollToMap}
            className={`text-sm font-medium ${SECTION.aegeanLink}`}
            aria-label="Scroll to map of places"
          >
            See map
          </button>
        )}
      </div>
    </footer>
  );
}
