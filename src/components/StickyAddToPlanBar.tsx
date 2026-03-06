"use client";

import { useEffect, useState } from "react";
import AddToItineraryButton from "@/components/AddToItineraryButton";

type StickyAddToPlanBarProps = {
  placeId: string;
  sentinelId: string;
  label?: string;
};

/**
 * Shows a sticky bottom bar with "Add to plan" on mobile when
 * the main CTA in the footer scrolls out of view.
 */
export default function StickyAddToPlanBar({
  placeId,
  sentinelId,
  label = "Add to plan",
}: StickyAddToPlanBarProps) {
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

  if (!show) return null;

  return (
    <div
      className="fixed left-0 right-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 flex items-center justify-center p-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-background/95 backdrop-blur-sm border-t border-sand-200/80 sm:hidden"
      role="complementary"
      aria-label="Add to plan"
    >
      <AddToItineraryButton placeId={placeId} label={label} className="w-full max-w-md" />
    </div>
  );
}
