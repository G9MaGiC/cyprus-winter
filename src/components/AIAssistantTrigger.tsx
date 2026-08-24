"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useBlockingOverlaysActive } from "@/hooks/useBlockingOverlaysActive";
import { AI_PULSE_SEEN_KEY } from "@/lib/local-storage-keys";
import { AI_TRIGGER, CTA } from "@/lib/design-tokens";

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
  const [pulseSeen, setPulseSeen] = useState(true);

  useEffect(() => {
    try {
      setPulseSeen(localStorage.getItem(AI_PULSE_SEEN_KEY) === "true");
    } catch {
      setPulseSeen(true);
    }
  }, []);

  const showPulse = variant === "default" && !pulseSeen && !blocked;

  const handleClick = () => {
    if (!pulseSeen) {
      try {
        localStorage.setItem(AI_PULSE_SEEN_KEY, "true");
      } catch {
        /* ignore quota / private mode */
      }
      setPulseSeen(true);
    }
    triggerAIAssistant();
  };

  const className =
    variant === "tertiaryOnDark"
      ? `${CTA.tertiaryOnDark} touch-manipulation`
      : AI_TRIGGER.default;

  return (
    <button
      type="button"
      disabled={blocked}
      onClick={handleClick}
      className={`${className} ${showPulse ? "ai-chat-trigger-pulse" : ""} ${blocked ? AI_TRIGGER.disabled : ""}`}
      aria-label={blocked ? tNav("askAIBlockedAria") : tNav("askAIAria")}
    >
      {variant === "default" ? (
        <>
          <span className={AI_TRIGGER.iconBadge} aria-hidden>
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
