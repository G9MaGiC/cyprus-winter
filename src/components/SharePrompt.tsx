"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function SharePrompt({ title, path }: { title: string; path: string }) {
  const t = useTranslations("share");
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
  const shareText = `${title} — Cyprus Winter`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: ignore
    }
  }

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: shareText, url: fullUrl });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  }

  return (
    <div className="flex items-center gap-3 py-3 border-t border-sand-200/60">
      <p className="text-sm text-sage flex-1">{t("prompt")}</p>
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium text-aegean hover:bg-aegean/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/40 focus-visible:ring-offset-2"
      >
        <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        {copied ? t("copied") : t("share")}
      </button>
    </div>
  );
}
