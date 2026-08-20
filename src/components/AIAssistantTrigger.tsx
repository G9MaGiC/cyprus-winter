"use client";

import { useTranslations } from "next-intl";
import { useBlockingOverlaysActive } from "@/hooks/useBlockingOverlaysActive";

const OPEN_AI_EVENT = "open-ai-assistant";

function blockingOverlayActive(): boolean {
  if (typeof document === "undefined") return false;
  return !!document.querySelector(
    '[data-overlay-priority="blocking"][data-overlay-active="true"]'
  );
}

export function triggerAIAssistant() {
  if (typeof window !== "undefined" && !blockingOverlayActive()) {
    window.dispatchEvent(new CustomEvent(OPEN_AI_EVENT));
  }
}

type AIAssistantTriggerProps = {
  variant?: "default" | "tertiaryOnDark";
  label?: string;
};

export default function AIAssistantTrigger({ variant = "default", label }: AIAssistantTriggerProps) {
  const tNav = useTranslations("nav");
  const blocked = useBlockingOverlaysActive();
  const resolvedLabel = label ?? tNav("askAI");

  const className =
    variant === "tertiaryOnDark"
      ? "inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-golden hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/60 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal touch-manipulation"
      : "group relative min-h-[48px] w-full max-w-lg px-6 sm:px-10 py-4 sm:py-5 rounded-xl bg-golden text-charcoal font-semibold text-base sm:text-lg hover:bg-golden/90 hover:shadow-lg active:scale-[0.98] transition-all duration-200 flex flex-wrap items-center justify-center gap-3 break-words focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-manipulation";

  return (
    <button
      type="button"
      disabled={blocked}
      onClick={() => triggerAIAssistant()}
      className={`${className} ${blocked ? "opacity-60 cursor-not-allowed" : ""}`}
      aria-label={blocked ? tNav("askAIBlockedAria") : tNav("askAIAria")}
    >
      {variant === "default" ? (
        <>
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-charcoal/10 text-charcoal transition-colors group-hover:bg-charcoal/15"
            aria-hidden
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </span>
          <span>{resolvedLabel}</span>
        </>
      ) : (
        <span>{resolvedLabel}</span>
      )}
    </button>
  );
}

export { OPEN_AI_EVENT };
