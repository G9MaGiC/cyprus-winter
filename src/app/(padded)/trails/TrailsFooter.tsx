"use client";

import Link from "next/link";
import { OPEN_AI_EVENT } from "@/components/AIAssistantTrigger";
import { SECTION, CTA, LAYOUT } from "@/lib/design-tokens";

type TrailsFooterProps = {
  reportTrailId?: string | null;
  onScrollToMap?: () => void;
};

export default function TrailsFooter({ reportTrailId, onScrollToMap }: TrailsFooterProps = {}) {
  return (
    <footer
      className={`${SECTION.footerBlock} pt-14 sm:pt-16 pb-8 sm:pb-12 ${LAYOUT.footerBottomClearance} text-center`}
      aria-label="Trails actions"
    >
      <p
        className={`text-sm text-olive/70 ${SECTION.headingGap} max-w-md mx-auto leading-relaxed`}
      >
        Conditions are crowd-sourced. Use your judgement and follow local advice.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/plan" className={CTA.primaryCompact}>
          Plan your trip
        </Link>
        <Link
          href={reportTrailId ? `/trails/${reportTrailId}/report` : "/trails"}
          className={CTA.secondaryCompact}
          aria-label="Report trail conditions"
        >
          Report conditions
        </Link>
        <Link
          href="/guides/troodos-december"
          className={`text-sm font-medium ${SECTION.aegeanLink}`}
        >
          Winter hiking guide
        </Link>
        <a
          href="tel:112"
          className={`text-sm font-medium ${SECTION.aegeanLink}`}
        >
          Emergency 112
        </a>
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new CustomEvent(OPEN_AI_EVENT))
          }
          className={`text-sm font-medium ${SECTION.aegeanLink}`}
          aria-label="Ask AI for trail suggestions"
        >
          Ask AI
        </button>
      </div>
      {onScrollToMap && (
        <button
          type="button"
          onClick={onScrollToMap}
          className={`text-sm ${SECTION.aegeanLink} mt-4 inline-block`}
          aria-label="Scroll to map of trails"
        >
          See map
        </button>
      )}
    </footer>
  );
}
