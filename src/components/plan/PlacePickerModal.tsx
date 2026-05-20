"use client";

import { useEffect, useRef } from "react";
import { TYPE } from "@/lib/design-tokens";
import { useTrapFocus } from "@/lib/useTrapFocus";
import PlacePicker from "@/components/PlacePicker";
import { useTranslations } from "next-intl";

type Props = {
  activeDayItems: string[];
  onAdd: (id: string) => void;
  onClose: () => void;
};

export default function PlacePickerModal({ activeDayItems, onAdd, onClose }: Props) {
  const tCommon = useTranslations("common");
  const tPlan = useTranslations("plan");
  const trapFocus = useTrapFocus();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousActiveRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = modalRef.current?.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])'
    );
    first?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousActiveRef.current?.focus?.();
    };
  }, []);

  const handleClose = () => {
    onClose();
  };

  const handleAdd = (id: string) => {
    onAdd(id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center p-4 pb-[env(safe-area-inset-bottom)] sm:p-6 sm:pb-6 bg-charcoal/60 backdrop-blur-sm supports-[backdrop-filter]:bg-charcoal/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="browse-places-title"
      onKeyDown={(e) => trapFocus(e, modalRef.current, handleClose)}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        className="w-full max-w-2xl max-h-[90dvh] sm:max-h-[85vh] flex flex-col bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden sm:mt-0 mt-auto animate-in slide-in-from-bottom duration-300 sm:animate-none"
      >
        <div className="flex items-center justify-between shrink-0 px-5 py-4 sm:py-5 border-b border-sand-200/80">
          <h2 id="browse-places-title" className={`${TYPE.cardTitle} text-lg sm:text-xl`}>
            {tPlan("browsePlaces")}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-olive/70 hover:text-olive hover:bg-sand-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={tCommon("aria.close")}
          >
            <span className="text-lg font-medium" aria-hidden>×</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6 sm:pb-6">
          <p className="text-sm text-olive/70 mb-4">
            {tPlan("placePickerIntro")}
          </p>
          <PlacePicker activeDayItems={activeDayItems} onAdd={handleAdd} />
        </div>
      </div>
    </div>
  );
}
