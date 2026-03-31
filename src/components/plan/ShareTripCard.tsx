"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CARD, CTA } from "@/lib/design-tokens";

export default function ShareTripCard({
  dayCount,
  placeCount,
  sharePath,
}: {
  dayCount: number;
  placeCount: number;
  sharePath: string;
}) {
  const t = useTranslations("plan.shareCard");
  const [copied, setCopied] = useState(false);

  if (placeCount < 2) return null;

  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${sharePath}` : sharePath;
  const shareText = t("shareText", { days: dayCount, places: placeCount });

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: shareText, url: fullUrl });
        return;
      } catch {
        // user cancelled or not supported
      }
    }
    try {
      await navigator.clipboard.writeText(`${shareText}\n${fullUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className={`${CARD.base} p-4 sm:p-5 bg-charcoal text-white`}>
      <div className="text-center">
        <p className="font-display text-lg font-semibold">{t("title")}</p>
        <p className="text-white/70 text-sm mt-1">
          {t("summary", { days: dayCount, places: placeCount })}
        </p>
        <button
          type="button"
          onClick={handleShare}
          className={`${CTA.primaryCompact} mt-4 bg-golden text-charcoal hover:bg-golden/90`}
        >
          <svg aria-hidden="true" className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {copied ? t("copied") : t("cta")}
        </button>
      </div>
    </div>
  );
}
