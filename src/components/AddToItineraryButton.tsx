"use client";

import AppLink from "@/components/AppLink";
import { useItinerary } from "@/hooks/useItinerary";
import { CTA, SECTION } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

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
  label,
  className = "",
}: AddToItineraryButtonProps) {
  const tCommon = useTranslations("common");
  const { days, hydrated } = useItinerary();
  const allIds = Object.values(days ?? {}).flat();
  const isInItinerary = hydrated && allIds.includes(placeId);
  const resolvedLabel = label ?? tCommon("addToPlan");

  if (!hydrated) {
    return (
      <AppLink
        href={`/plan?add=${placeId}`}
        className={`${CTA.primaryCompact} w-full sm:w-auto gap-2 ${className}`}
      >
        {resolvedLabel} →
      </AppLink>
    );
  }

  if (isInItinerary) {
    return (
      <span
        className={`inline-flex flex-wrap items-center gap-2 min-h-[44px] px-5 py-3 rounded-lg bg-aegean/15 text-aegean font-medium ${className}`}
        aria-label={`${placeId} is in your itinerary`}
      >
        <span aria-hidden>✓</span> {tCommon("inYourPlan")}
        <AppLink
          href="/plan"
          className={`${SECTION.aegeanLink} min-w-[44px] px-3 -my-3 -mx-1 text-sm font-medium touch-manipulation`}
          aria-label="View your plan"
        >
          {tCommon("viewPlan")} →
        </AppLink>
      </span>
    );
  }

  return (
    <AppLink
      href={`/plan?add=${placeId}`}
      className={`${CTA.primaryCompact} w-full sm:w-auto gap-2 ${className}`}
    >
      {resolvedLabel} →
    </AppLink>
  );
}
