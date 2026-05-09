"use client";

import AppLink from "@/components/AppLink";
import { useItinerary } from "@/hooks/useItinerary";
import { CTA, SECTION } from "@/lib/design-tokens";
import { track, trackProduct } from "@/lib/analytics";
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
  const { days, hydrated, addToDayIfMissing } = useItinerary();
  const allIds = Object.values(days ?? {}).flat();
  const isInItinerary = hydrated && allIds.includes(placeId);
  const resolvedLabel = label ?? tCommon("addToPlan");

  if (!hydrated) {
    return (
      <AppLink
        href={`/plan?add=${placeId}`}
        data-testid={`add-to-plan-${placeId}`}
        className={`${CTA.primaryCompact} w-full sm:w-auto gap-2 ${className}`}
      >
        {resolvedLabel} →
      </AppLink>
    );
  }

  if (isInItinerary) {
    return (
      <span
        data-testid={`in-plan-${placeId}`}
        className={`inline-flex flex-wrap items-center gap-2 min-h-[44px] px-5 py-3 rounded-lg bg-aegean/15 text-aegean font-medium ${className}`}
        aria-label={tCommon("aria.placeInItinerary", { id: placeId })}
      >
        <span aria-hidden>✓</span> {tCommon("inYourPlan")}
        <AppLink
          href="/plan"
          className={`${SECTION.aegeanLink} min-w-[44px] px-3 -my-3 -mx-1 text-sm font-medium touch-manipulation`}
          aria-label={tCommon("aria.viewPlan")}
        >
          {tCommon("viewPlan")} →
        </AppLink>
      </span>
    );
  }

  const handleInlineAdd = () => {
    addToDayIfMissing(placeId);
    track("inline_plan_add_click", { place_id: placeId });
    trackProduct("plan_add", { item_id: placeId, source: "inline_button" });
  };

  return (
    <button
      type="button"
      onClick={handleInlineAdd}
      data-testid={`add-to-plan-${placeId}`}
      className={`${CTA.primaryCompact} w-full sm:w-auto gap-2 ${className}`}
      aria-label={`${resolvedLabel}: ${placeId}`}
    >
      {resolvedLabel} →
    </button>
  );
}
