"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CARD, CTA } from "@/lib/design-tokens";

export default function PlanSavePrompt({ itemCount }: { itemCount: number }) {
  const t = useTranslations("plan.savePrompt");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || itemCount < 3 || status === "success") {
    if (status === "success") {
      return (
        <div className={`${CARD.base} p-4 text-center`} role="status">
          <p className="text-sm font-medium text-sage">{t("successMessage")}</p>
        </div>
      );
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;
    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "plan-save" }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className={`${CARD.base} p-4 sm:p-5 border-l-4 border-l-aegean/40`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-sm font-semibold text-olive">{t("title", { count: itemCount })}</p>
          <p className="text-xs text-sage mt-1">{t("subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-olive/40 hover:text-olive/70 transition-colors"
          aria-label={t("dismiss")}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
        <label htmlFor="plan-save-email" className="sr-only">{t("emailLabel")}</label>
        <input
          id="plan-save-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("placeholder")}
          className="flex-1 min-h-[44px] px-3 py-2 rounded-lg border border-sand-200 bg-white text-sm text-charcoal placeholder:text-olive/50 focus:outline-none focus:ring-2 focus:ring-aegean/40"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={`${CTA.primaryCompact} whitespace-nowrap ${status === "loading" ? "opacity-60" : ""}`}
        >
          {status === "loading" ? t("sending") : t("cta")}
        </button>
      </form>
      {status === "error" && (
        <p className="text-xs text-terracotta mt-2">{t("error")}</p>
      )}
    </div>
  );
}
