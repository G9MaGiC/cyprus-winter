"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import { TrackOnClick } from "@/components/TrackOnClick";
import { LAYOUT } from "@/lib/design-tokens";

type TrailDetailStickyActionsProps = {
  trailId: string;
};

/**
 * Sticky CTA bar on trail detail: Add to plan + Report conditions.
 * Appears when user scrolls past the hero; 44px touch targets, focus-visible.
 */
export default function TrailDetailStickyActions({ trailId }: TrailDetailStickyActionsProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const heroHeight = typeof window !== "undefined" ? window.innerHeight * 0.6 : 400;
      setVisible(window.scrollY > heroHeight);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-sand-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] bottom-0 md:bottom-0 max-md:bottom-[calc(3.5rem+env(safe-area-inset-bottom))] py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      role="complementary"
      aria-label="Quick actions"
    >
      <div className={`${LAYOUT.detail} mx-auto ${LAYOUT.safeAreaX} py-3 flex flex-wrap items-center justify-center gap-3 sm:gap-4`}>
        <TrackOnClick event="plan_add" properties={{ placeId: trailId, placeType: "trail", source: "sticky" }}>
          <AddToItineraryButton placeId={trailId} label="Add to plan" className="shrink-0" />
        </TrackOnClick>
        <Link
          href={`/trails/${trailId}/report`}
          className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 rounded-lg border-2 border-aegean text-aegean font-medium hover:bg-aegean/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean focus-visible:ring-offset-2 focus-visible:ring-offset-background shrink-0"
        >
          Report conditions
        </Link>
      </div>
    </div>
  );
}
