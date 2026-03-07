"use client";

import { useEffect, useRef } from "react";
import { useTrapFocus } from "@/lib/useTrapFocus";
import { CARD } from "@/lib/design-tokens";

type Props = {
  activeDay: number;
  placeCount: number;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ClearDayModal({ activeDay, placeCount, onClose, onConfirm }: Props) {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm supports-[backdrop-filter]:bg-charcoal/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="clear-day-title"
      onKeyDown={(e) => trapFocus(e, modalRef.current, onClose)}
    >
      <div
        ref={modalRef}
        className={`w-full max-w-md ${CARD.base} ${CARD.content} shadow-2xl`}
      >
        <h2 id="clear-day-title" className="font-display text-lg font-semibold text-olive mb-2">
          Clear Day {activeDay}?
        </h2>
        <p className="text-olive/80 text-sm mb-6 break-words">
          Remove all {placeCount} {placeCount === 1 ? "place" : "places"} from Day {activeDay}? You can add them back anytime.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-medium text-olive border border-sand-200/80 hover:bg-sand-100 transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-medium bg-terracotta text-white hover:bg-terracotta-muted transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Clear day
          </button>
        </div>
      </div>
    </div>
  );
}
