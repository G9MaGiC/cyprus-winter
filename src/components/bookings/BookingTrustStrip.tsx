"use client";

import { useTranslations } from "next-intl";

type BookingTrustStripProps = {
  variant?: "winery" | "guide";
  /**
   * Whether the partner passes isPartnerVerified() (deliverable contact).
   * The "Verified … route" + email-SLA claims are only true for verified
   * partners — for everyone else show the honest request-logged line (BUG-355).
   */
  verified?: boolean;
};

export default function BookingTrustStrip({ variant = "winery", verified = false }: BookingTrustStripProps) {
  const t = useTranslations("book.form.trust");
  const context =
    variant === "guide" ? t("contextGuide") : t("contextPartner");

  return (
    <section className="rounded-xl border border-aegean/20 bg-aegean/5 p-4" aria-label={t("aria")}>
      <p className="text-xs font-semibold uppercase tracking-wider text-aegean">{t("heading")}</p>
      <ul className="mt-2 space-y-1.5 text-sm text-olive/85">
        {verified ? (
          <>
            <li>{t("verifiedRoute", { context })}</li>
            <li>{t("emailConfirm")}</li>
          </>
        ) : (
          <li>{t("requestLoggedFallback", { context })}</li>
        )}
        <li>{t("noCharge")}</li>
      </ul>
    </section>
  );
}
