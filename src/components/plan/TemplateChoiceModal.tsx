"use client";

import { useEffect, useRef } from "react";
import { useTrapFocus } from "@/lib/useTrapFocus";
import { CARD, CTA, LAYER, SECTION, TYPE } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

type Props = {
  templateLabel: string;
  onClose: () => void;
  onAddToPlan: () => void;
  onReplace: () => void;
};

export default function TemplateChoiceModal({ templateLabel, onClose, onAddToPlan, onReplace }: Props) {
  const trapFocus = useTrapFocus();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);
  const t = useTranslations("plan.templateChoiceModal");

  useEffect(() => {
    previousActiveRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = modalRef.current?.querySelector<HTMLElement>(
      'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
    );
    first?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousActiveRef.current?.focus?.();
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 ${LAYER.modal} flex items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4 bg-charcoal/60 backdrop-blur-sm supports-[backdrop-filter]:bg-charcoal/50`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-choice-title"
      aria-describedby="template-choice-desc"
      onKeyDown={(e) => trapFocus(e, modalRef.current, onClose)}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className={`w-full max-w-md max-h-[90dvh] overflow-y-auto ${CARD.base} ${CARD.content} ${CARD.contentLg} shadow-2xl`}
      >
        <h2 id="template-choice-title" className={`${TYPE.sectionTitle} text-xl sm:text-2xl ${SECTION.titleGap}`}>
          {t("title", { template: templateLabel })}
        </h2>
        <p id="template-choice-desc" className={`text-olive/80 text-sm ${SECTION.headingGap} break-words leading-relaxed`}>
          {t("description")}
        </p>
        <div className="flex flex-col-reverse sm:flex-row sm:flex-wrap gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className={`${CTA.modalDismiss} order-last sm:order-none`}
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={onReplace}
            className={CTA.modalSecondary}
          >
            {t("replaceDay")}
          </button>
          <button
            type="button"
            onClick={onAddToPlan}
            className={CTA.modalPrimary}
          >
            {t("addToPlan")}
          </button>
        </div>
      </div>
    </div>
  );
}
