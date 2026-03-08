"use client";

import { useEffect, useRef } from "react";
import { useTrapFocus } from "@/lib/useTrapFocus";
import { CARD, SECTION, TYPE } from "@/lib/design-tokens";

type Props = {
  templateLabel: string;
  onClose: () => void;
  onAddToPlan: () => void;
  onReplace: () => void;
};

export default function TemplateChoiceModal({ templateLabel, onClose, onAddToPlan, onReplace }: Props) {
  const trapFocus = useTrapFocus();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const first = modalRef.current?.querySelector<HTMLElement>(
      'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
    );
    first?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4 bg-charcoal/60 backdrop-blur-sm supports-[backdrop-filter]:bg-charcoal/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-choice-title"
      onKeyDown={(e) => trapFocus(e, modalRef.current, onClose)}
    >
      <div
        ref={modalRef}
        className={`w-full max-w-md ${CARD.base} ${CARD.content} shadow-2xl`}
      >
        <h2 id="template-choice-title" className={`${TYPE.cardTitle} ${SECTION.titleGap}`}>
          Apply {templateLabel} template?
        </h2>
        <p className={`text-olive/80 text-sm ${SECTION.headingGap} break-words`}>
          Replace what you have, add to it, or keep building. Your call.
        </p>
        <div className="flex flex-col-reverse sm:flex-row sm:flex-wrap gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-medium text-olive border border-sand-200/80 hover:bg-sand-100 transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onAddToPlan}
            className="min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-medium border border-aegean text-aegean hover:bg-aegean/10 transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Add to my plan
          </button>
          <button
            type="button"
            onClick={onReplace}
            className="min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-medium bg-terracotta text-white hover:bg-terracotta-muted transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Replace my plan (clears current)
          </button>
        </div>
      </div>
    </div>
  );
}
