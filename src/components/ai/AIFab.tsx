"use client";

import { triggerAIAssistant } from "@/components/AIAssistantTrigger";
import { useTranslations } from "next-intl";

/**
 * Floating action button (mobile-only) that opens the AI assistant.
 * Positioned above the bottom nav and any sticky bars.
 */
export default function AIFab() {
  const tCommon = useTranslations("common");

  return (
    <button
      type="button"
      onClick={triggerAIAssistant}
      aria-label={tCommon("ai.title")}
      className={[
        // Mobile only — desktop has the AI button in the top nav
        "md:hidden",
        // Fixed position above bottom nav
        "fixed right-4 z-[45]",
        "bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))]",
        // Appearance
        "w-12 h-12 rounded-full bg-terracotta text-white shadow-lg",
        "flex items-center justify-center",
        "hover:bg-terracotta/90 active:scale-95 transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2",
      ].join(" ")}
    >
      {/* Chat bubble icon */}
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
    </button>
  );
}
