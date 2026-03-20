"use client";

import { useTranslations } from "next-intl";

type BookingTrustStripProps = {
  variant?: "winery" | "guide";
};

export default function BookingTrustStrip({ variant = "winery" }: BookingTrustStripProps) {
  const t = useTranslations("book.trustStrip");
  return (
    <section className="rounded-xl border border-aegean/20 bg-aegean/5 p-4" aria-label={t("aria")}>
      <p className="text-xs font-semibold uppercase tracking-wider text-aegean">{t("title")}</p>
      <ul className="mt-2 space-y-1.5 text-sm text-olive/85">
        <li>{t("verified", { context: variant === "guide" ? t("contextGuide") : t("contextPartner") })}</li>
        <li>{t("confirmation")}</li>
        <li>{t("noCharge")}</li>
      </ul>
    </section>
  );
}
