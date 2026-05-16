"use client";

import type { ReactNode } from "react";
import { OPEN_AI_EVENT } from "@/components/AIAssistantTrigger";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import NavigateButton from "@/components/NavigateButton";
import { TrackOnClick } from "@/components/TrackOnClick";
import { CTA } from "@/lib/design-tokens";
import type { PlanItem } from "@/data";
import { useTranslations } from "next-intl";

export type DetailActionFooterProps = {
  placeId: string;
  placeType: string;
  place?: PlanItem;
  body: string;
  ariaLabel: string;
  sentinelId?: string;
  children?: ReactNode;
};

/**
 * Standard detail page footer: body copy, Navigate, Add to plan, Ask AI.
 * @see docs/UX_PATTERNS.md
 */
export default function DetailActionFooter({
  placeId,
  placeType,
  place,
  body,
  ariaLabel,
  sentinelId = "add-to-plan-sentinel",
  children,
}: DetailActionFooterProps) {
  const tDiscover = useTranslations("discover");

  return (
    <footer
      className="pt-8 pb-4 border-t border-sand-200/80 flex flex-col sm:flex-row sm:items-center gap-4 relative"
      aria-label={ariaLabel}
    >
      <div id={sentinelId} aria-hidden className="h-px absolute top-0 left-0 right-0 pointer-events-none" />
      <p className="text-olive/70 text-sm break-words flex-1">{body}</p>
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto [&_a]:w-full [&_a]:sm:w-auto [&_button]:w-full [&_button]:sm:w-auto">
        {place ? <NavigateButton place={place} /> : null}
        <TrackOnClick event="plan_add" properties={{ placeId, placeType }}>
          <AddToItineraryButton placeId={placeId} className="sm:shrink-0 w-full sm:w-auto" />
        </TrackOnClick>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent(OPEN_AI_EVENT))}
          className={`${CTA.secondaryCompact} w-full sm:w-auto justify-center`}
          aria-label={tDiscover("aria.askAi")}
        >
          {tDiscover("footer.askAi")}
        </button>
        {children}
      </div>
    </footer>
  );
}
