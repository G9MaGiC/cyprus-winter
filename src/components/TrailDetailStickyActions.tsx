"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPlaceById } from "@/data";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import NavigateButton from "@/components/NavigateButton";
import { TrackOnClick } from "@/components/TrackOnClick";
import { LAYOUT } from "@/lib/design-tokens";

type TrailDetailStickyActionsProps = {
  trailId: string;
  /** ID of sentinel element—bar appears when sentinel scrolls out of view (avoids duplicate with in-page CTA) */
  sentinelId: string;
};

/**
 * Sticky CTA bar on trail detail: Add to plan + Report conditions.
 * Appears when the footer CTA scrolls out of view; 44px touch targets, focus-visible.
 */
export default function TrailDetailStickyActions({ trailId, sentinelId }: TrailDetailStickyActionsProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById(sentinelId);
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelId]);

  if (!visible) return null;

  return (
    <div
      className={`fixed left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-sand-200/80 shadow-sm sm:hidden ${LAYOUT.fixedBottomAboveNavMaxMd} py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]`}
      role="complementary"
      aria-label="Quick actions"
    >
      <div className={`${LAYOUT.detail} mx-auto ${LAYOUT.safeAreaX} py-3 flex flex-wrap items-center justify-center gap-3 sm:gap-4`}>
        {(() => {
          const place = getPlaceById(trailId);
          return place ? <NavigateButton place={place} className="shrink-0" /> : null;
        })()}
        <TrackOnClick event="plan_add" properties={{ placeId: trailId, placeType: "trail", source: "sticky" }}>
          <AddToItineraryButton placeId={trailId} label="Add to plan" className="shrink-0" />
        </TrackOnClick>
        <Link
          href={`/trails/${trailId}/report`}
          className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 rounded-lg border-2 border-aegean text-aegean font-medium hover:bg-aegean/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean focus-visible:ring-offset-2 focus-visible:ring-offset-background shrink-0"
          aria-label="Report conditions for this trail"
        >
          Report conditions
        </Link>
      </div>
    </div>
  );
}
