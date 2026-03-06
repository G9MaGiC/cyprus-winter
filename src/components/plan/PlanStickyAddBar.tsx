"use client";

import { useEffect, useState } from "react";

type PlanStickyAddBarProps = {
  sentinelId: string;
  scrollTargetId: string;
};

/**
 * Shows a sticky bottom bar with "Add place" on mobile when the add-places
 * section scrolls out of view. Clicking scrolls back to the Pair with / Browse area.
 */
export default function PlanStickyAddBar({ sentinelId, scrollTargetId }: PlanStickyAddBarProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById(sentinelId);
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShow(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelId]);

  const handleClick = () => {
    const target = document.getElementById(scrollTargetId);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!show) return null;

  return (
    <div
      className="fixed left-0 right-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 flex items-center justify-center p-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-background/95 backdrop-blur-sm border-t border-sand-200/80 sm:hidden"
      role="complementary"
      aria-label="Add place"
    >
      <button
        type="button"
        onClick={handleClick}
        className="w-full max-w-md min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-semibold bg-terracotta text-white hover:bg-terracotta/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] motion-reduce:active:scale-100"
      >
        Add place
      </button>
    </div>
  );
}
