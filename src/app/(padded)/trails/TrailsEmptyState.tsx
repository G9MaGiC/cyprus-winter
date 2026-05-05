"use client";

import { Link } from "@/i18n/navigation";
import { CTA, EMPTY_STATE_LARGE } from "@/lib/design-tokens";
import { OPEN_AI_EVENT } from "@/components/AIAssistantTrigger";

export default function TrailsEmptyState() {
  return (
    <div
      className={`${EMPTY_STATE_LARGE} max-w-md mx-auto`}
      role="status"
      aria-live="polite"
    >
      <p className="text-olive/80 leading-relaxed break-words mb-6">
        No trails match your filters. Try different status, difficulty, or region—or ask the AI. It
        knows Troodos to coast.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/trails" className={`inline-flex justify-center min-w-[140px] ${CTA.primaryCompact}`}>
          All trails
        </Link>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent(OPEN_AI_EVENT))}
          className={CTA.secondaryCompact}
          aria-label="Ask AI for trail suggestions"
        >
          Ask AI
        </button>
        <Link href="/discover" className={CTA.secondaryCompact}>
          Discover
        </Link>
      </div>
    </div>
  );
}
