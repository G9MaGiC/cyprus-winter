"use client";

import { useState, useEffect } from "react";
import { Lightbulb } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CARD, SECTION } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

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
  const tCommon = useTranslations("common");
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={`${CARD.info} border-l-4 border-aegean p-4 flex items-start gap-3 transition-opacity duration-200 ${
        entered ? "opacity-100" : "opacity-0"
      }`}
      role="status"
      aria-live="polite"
    >
      <Lightbulb className="h-5 w-5 shrink-0 text-aegean mt-0.5" aria-hidden />
      <div className="flex-1 min-w-0">
        <p className="text-base text-olive/90 leading-relaxed">{message}</p>
        {href && hrefLabel && (
          <Link
            href={href}
            className={`mt-2 ${SECTION.aegeanLink}`}
          >
            {hrefLabel}
          </Link>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center text-olive/50 hover:text-olive text-sm rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
        aria-label={tCommon("aria.dismissTip")}
      >
        ×
      </button>
    </div>
  );
}
