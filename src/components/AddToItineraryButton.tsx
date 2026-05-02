"use client";

import Link from "next/link";
import { useItinerary } from "@/hooks/useItinerary";
import { track } from "@/lib/analytics";
import { getPlaceById } from "@/data";

type AddToItineraryButtonProps = {
  placeId: string;
  label?: string;
  className?: string;
};

/**
 * Shows "In your plan ✓" when the place is already in the plan,
 * or "Add to plan →" link to /plan?add={id} when not.
 */
export default function AddToItineraryButton({
  placeId,
  label = "Add to plan",
  className = "",
}: AddToItineraryButtonProps) {
  const { days, hydrated } = useItinerary();
  const allIds = Object.values(days ?? {}).flat();
  const isInItinerary = hydrated && allIds.includes(placeId);
  const placeName = getPlaceById(placeId)?.name ?? "This place";

  if (!hydrated) {
    return (
      <Link
        href={`/plan?add=${placeId}`}
        onClick={() =>
          track("plan_add", {
            placeId,
            source: "add_to_itinerary_button",
          })
        }
        className={`inline-flex items-center justify-center min-h-[44px] gap-2 px-5 py-3 rounded-lg bg-terracotta text-white font-semibold hover:bg-terracotta-muted transition-colors w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
      >
        {label} →
      </Link>
    );
  }

  if (isInItinerary) {
    return (
      <span
        className={`inline-flex flex-wrap items-center gap-2 min-h-[44px] px-5 py-3 rounded-lg bg-aegean/15 text-aegean font-medium ${className}`}
        aria-label={`${placeName} is in your plan`}
      >
        <span aria-hidden>✓</span> In your plan
        <Link
          href="/plan"
          className="inline-flex items-center min-h-[44px] min-w-[44px] py-3 px-3 -my-3 -mx-1 text-aegean/90 hover:text-aegean underline text-sm font-medium rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-manipulation"
          aria-label="View your plan"
        >
          View plan →
        </Link>
      </span>
    );
  }

  return (
    <Link
      href={`/plan?add=${placeId}`}
      onClick={() =>
        track("plan_add", {
          placeId,
          source: "add_to_itinerary_button",
        })
      }
      className={`inline-flex items-center justify-center min-h-[44px] gap-2 px-5 py-3 rounded-lg bg-terracotta text-white font-semibold hover:bg-terracotta-muted transition-colors w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
    >
      {label} →
    </Link>
  );
}
