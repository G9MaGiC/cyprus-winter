"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LAYOUT } from "@/lib/design-tokens";

type StickyPlanBarProps = {
  sentinelId: string;
};

/**
 * Shows a sticky bottom bar with "Plan your trip" on mobile when
 * the sentinel scrolls out of view. Surfaces Plan CTA without reordering sections.
 */
export default function StickyPlanBar({ sentinelId }: StickyPlanBarProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById(sentinelId);
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only show after the user has scrolled past the sentinel (sentinel above viewport),
        // not when the sentinel is simply below the fold on initial load.
        const passedSentinel = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setShow(passedSentinel);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelId]);

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
