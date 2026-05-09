"use client";

import { useEffect, useRef } from "react";
import { useTrapFocus } from "@/lib/useTrapFocus";
import { CARD, SECTION, TYPE } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

type Props = {
  activeDay: number;
  placeCount: number;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ClearDayModal({ activeDay, placeCount, onClose, onConfirm }: Props) {
  const tCommon = useTranslations("common");
  const trapFocus = useTrapFocus();
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4 bg-charcoal/60 backdrop-blur-sm supports-[backdrop-filter]:bg-charcoal/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="clear-day-title"
      aria-describedby="clear-day-desc"
      onKeyDown={(e) => trapFocus(e, modalRef.current, onClose)}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className={`w-full max-w-md max-h-[90dvh] overflow-y-auto ${CARD.base} ${CARD.content} ${CARD.contentLg} shadow-2xl rounded-2xl`}
      >
        <h2 id="clear-day-title" className={`${TYPE.sectionTitle} text-xl sm:text-2xl ${SECTION.titleGap}`}>
          {tCommon("clearDayTitle", { day: activeDay })}
        </h2>
        <p id="clear-day-desc" className={`text-olive/80 text-sm ${SECTION.headingGap} break-words leading-relaxed`}>
          {tCommon("removeAllFromDay", { count: placeCount, day: activeDay })}
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-medium border border-terracotta/60 text-terracotta hover:bg-terracotta/5 transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background w-full sm:w-auto"
          >
            {tCommon("clearDay")}
          </button>
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-medium bg-terracotta text-white hover:bg-terracotta-muted transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-background w-full sm:w-auto order-last sm:order-none"
          >
            {tCommon("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
