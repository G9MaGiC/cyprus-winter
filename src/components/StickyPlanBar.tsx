"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LAYOUT } from "@/lib/design-tokens";
import { useStickyPlanBar } from "@/contexts/StickyPlanBarContext";
import { FOOTER_SENTINEL_ID } from "@/lib/footer";

type StickyPlanBarProps = {
  sentinelId: string;
};

/**
 * Shows a sticky bottom bar with "Plan your trip" on mobile when
 * the sentinel scrolls out of view. Surfaces Plan CTA without reordering sections.
 * Hides when footer is in view to prevent overlap.
 */
export default function StickyPlanBar({ sentinelId }: StickyPlanBarProps) {
  const [show, setShow] = useState(false);
  const { setStickyPlanVisible } = useStickyPlanBar();

  useEffect(() => {
    const sentinel = document.getElementById(sentinelId);
    const footerSentinel = document.getElementById(FOOTER_SENTINEL_ID);
    if (!sentinel) return;

    let passedPlan = false;
    let footerInView = false;

    const updateShow = () => {
      setShow(passedPlan && !footerInView);
    };

    const planObserver = new IntersectionObserver(
      ([entry]) => {
        passedPlan = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        updateShow();
      },
      { threshold: 0 }
    );

    const footerObserver = footerSentinel
      ? new IntersectionObserver(
          ([entry]) => {
            footerInView = entry.isIntersecting;
            updateShow();
          },
          { threshold: 0 }
        )
      : null;

    planObserver.observe(sentinel);
    if (footerSentinel && footerObserver) footerObserver.observe(footerSentinel);

    return () => {
      planObserver.disconnect();
      footerObserver?.disconnect();
    };
  }, [sentinelId]);

  useEffect(() => {
    setStickyPlanVisible(show);
    return () => setStickyPlanVisible(false);
  }, [show, setStickyPlanVisible]);

  if (!show) return null;

  return (
    <div
      className={`fixed left-0 right-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 flex items-center justify-center pt-4 ${LAYOUT.safeAreaX} pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-background/95 backdrop-blur-sm border-t border-sand-200/80 sm:hidden`}
      role="complementary"
      aria-label="Plan your trip"
    >
      <Link
        href="/plan"
        className="inline-flex items-center justify-center min-h-[48px] w-full max-w-md px-6 py-3 rounded-xl bg-terracotta text-white font-semibold hover:bg-terracotta-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Plan your trip
      </Link>
    </div>
  );
}
