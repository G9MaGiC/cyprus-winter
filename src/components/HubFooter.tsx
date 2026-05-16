"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import AppLink from "@/components/AppLink";
import { OPEN_AI_EVENT } from "@/components/AIAssistantTrigger";
import { TrackOnClick } from "@/components/TrackOnClick";
import { SECTION, CTA } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export type HubFooterProps = {
  body: string;
  ariaLabel: string;
  primaryHref?: string;
  primaryLabel?: string;
  showAskAi?: boolean;
  askAiLabel?: string;
  askAiAriaLabel?: string;
  onScrollToMap?: () => void;
  scrollToMapLabel?: string;
  scrollToMapAriaLabel?: string;
  secondary?: ReactNode;
  className?: string;
  /** Analytics page id (defaults to pathname). */
  analyticsPage?: string;
};

/**
 * Standard hub/list page footer: Plan + Ask AI (+ optional map scroll / secondary slot).
 * @see docs/UX_PATTERNS.md
 */
export default function HubFooter({
  body,
  ariaLabel,
  primaryHref = "/plan",
  primaryLabel,
  showAskAi = true,
  askAiLabel,
  askAiAriaLabel,
  onScrollToMap,
  scrollToMapLabel,
  scrollToMapAriaLabel,
  secondary,
  className = "",
  analyticsPage,
}: HubFooterProps) {
  const pathname = usePathname();
  const page = analyticsPage ?? pathname ?? "";
  const tCommon = useTranslations("common");
  const resolvedPrimaryLabel = primaryLabel ?? tCommon("planYourTrip");
  const resolvedAskAiLabel = askAiLabel ?? tCommon("askAI");
  const resolvedAskAiAria = askAiAriaLabel ?? tCommon("askAITrailsAria");

  return (
    <footer
      className={`${SECTION.footerBlock} pt-14 sm:pt-16 pb-8 sm:pb-12 text-center ${className}`}
      aria-label={ariaLabel}
    >
      <p className={`text-sm text-olive/70 ${SECTION.headingGap} max-w-md mx-auto leading-relaxed`}>
        {body}
      </p>
      <div className="flex flex-col max-sm:items-stretch sm:flex-row sm:flex-wrap items-center justify-center gap-3 [&_a]:w-full [&_a]:sm:w-auto [&_button]:w-full [&_button]:sm:w-auto">
        <TrackOnClick event="hub_footer_click" properties={{ action: "plan", page }}>
          <AppLink href={primaryHref} className={CTA.primaryCompact}>
            {resolvedPrimaryLabel}
          </AppLink>
        </TrackOnClick>
        {showAskAi && (
          <TrackOnClick event="hub_footer_click" properties={{ action: "ask_ai", page }}>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent(OPEN_AI_EVENT))}
              className={CTA.secondaryCompact}
              aria-label={resolvedAskAiAria}
            >
              {resolvedAskAiLabel}
            </button>
          </TrackOnClick>
        )}
        {onScrollToMap && scrollToMapLabel && (
          <button
            type="button"
            onClick={onScrollToMap}
            className={`text-sm font-medium ${SECTION.aegeanLink}`}
            aria-label={scrollToMapAriaLabel ?? scrollToMapLabel}
          >
            {scrollToMapLabel}
          </button>
        )}
      </div>
      {secondary ? <div className="mt-6 space-y-3">{secondary}</div> : null}
    </footer>
  );
}
