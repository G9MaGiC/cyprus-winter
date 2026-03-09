"use client";

import { Lightbulb } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CARD } from "@/lib/design-tokens";

type OnboardingContextualTipProps = {
  message: string;
  onDismiss: () => void;
  href?: string;
  hrefLabel?: string;
};

/**
 * Compact, dismissible inline tip for contextual onboarding.
 * Used on Plan empty state, Discover filter, first Add to plan.
 */
export default function OnboardingContextualTip({
  message,
  onDismiss,
  href,
  hrefLabel,
}: OnboardingContextualTipProps) {
  return (
    <div
      className={`${CARD.base} border-l-4 border-aegean p-4 flex items-start gap-3`}
      role="status"
      aria-live="polite"
    >
      <Lightbulb className="h-5 w-5 shrink-0 text-aegean mt-0.5" aria-hidden />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-olive/90">{message}</p>
        {href && hrefLabel && (
          <Link
            href={href}
            className="inline-block mt-2 text-sm font-medium text-aegean hover:text-aegean/80 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 rounded"
          >
            {hrefLabel}
          </Link>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 text-olive/50 hover:text-olive text-sm p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50"
        aria-label="Dismiss tip"
      >
        ×
      </button>
    </div>
  );
}
