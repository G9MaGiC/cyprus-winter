"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LAYOUT, SECTION, TYPE, CTA } from "@/lib/design-tokens";

export default function LeadCapture() {
  const t = useTranslations("leadCapture");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;
    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "lead-magnet" }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <section
        aria-label={t("title")}
        className={`${SECTION.py} bg-aegean/5 ${LAYOUT.safeAreaX}`}
      >
        <div className={`${LAYOUT.listNarrow} mx-auto text-center`}>
          <p className="font-display text-xl font-semibold text-aegean">{t("successTitle")}</p>
          <p className="text-sage mt-2">{t("successBody")}</p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label={t("title")}
      className={`${SECTION.py} bg-aegean/5 ${LAYOUT.safeAreaX}`}
    >
      <div className={`${LAYOUT.listNarrow} mx-auto text-center`}>
        <p className={`${TYPE.kicker} text-aegean mb-2`}>{t("kicker")}</p>
        <h2 className={`${TYPE.sectionTitle} ${SECTION.titleGap}`}>{t("title")}</h2>
        <p className={`${TYPE.sectionSubtitle} max-w-xl mx-auto ${SECTION.headingGap}`}>
          {t("subtitle")}
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
        >
          <label htmlFor="lead-email" className="sr-only">{t("emailLabel")}</label>
          <input
            id="lead-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("placeholder")}
            className="w-full sm:flex-1 min-h-[44px] px-4 py-3 rounded-xl border border-sand-200 bg-white text-charcoal placeholder:text-olive/50 focus:outline-none focus:ring-2 focus:ring-aegean/40 focus:border-aegean transition-colors"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className={`${CTA.primary} whitespace-nowrap ${status === "loading" ? "opacity-60 cursor-wait" : ""}`}
          >
            {status === "loading" ? t("sending") : t("cta")}
          </button>
        </form>

        {status === "error" && (
          <p className="text-sm text-terracotta mt-3">{t("error")}</p>
        )}
      </div>
    </section>
  );
}
