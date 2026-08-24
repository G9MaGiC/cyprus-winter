"use client";

import { triggerAIAssistant } from "@/components/AIAssistantTrigger";
import { useBlockingOverlaysActive } from "@/hooks/useBlockingOverlaysActive";
import { AI_TRIGGER, CTA } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

type AskAIButtonProps = {
  className?: string;
  label?: string;
  ariaLabel?: string;
};

export default function AskAIButton({
  className = CTA.secondaryCompact,
  label,
  ariaLabel,
}: AskAIButtonProps) {
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const blocked = useBlockingOverlaysActive();

  return (
    <button
      type="button"
      disabled={blocked}
      onClick={() => triggerAIAssistant()}
      className={`${className} ${blocked ? AI_TRIGGER.disabled : ""}`}
      aria-label={blocked ? tNav("askAIBlockedAria") : (ariaLabel ?? tCommon("askAIAria"))}
    >
      {label ?? tCommon("askAI")}
    </button>
  );
}
