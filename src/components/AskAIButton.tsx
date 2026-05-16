"use client";

import { OPEN_AI_EVENT } from "@/components/AIAssistantTrigger";
import { CTA } from "@/lib/design-tokens";
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
  const t = useTranslations("common");

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_AI_EVENT))}
      className={className}
      aria-label={ariaLabel ?? t("askAIAria")}
    >
      {label ?? t("askAI")}
    </button>
  );
}
