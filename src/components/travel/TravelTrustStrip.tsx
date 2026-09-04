"use client";

import { advisoryLinkForLocale } from "@/lib/advisory-links";
import { SECTION, TYPE } from "@/lib/design-tokens";
import { useLocale, useTranslations } from "next-intl";

/** Calm official-travel links (P0-02); advisory per locale (AUD-25). */
export default function TravelTrustStrip({ className = "" }: { className?: string }) {
  const t = useTranslations("travelTrust");
  const locale = useLocale();

  return (
    <aside
      className={`rounded-2xl border border-sand-200/80 bg-sand-100/40 px-4 py-4 sm:px-5 sm:py-5 ${className}`}
      aria-label={t("aria")}
    >
      <p className={`${TYPE.kicker} text-muted-ink`}>{t("heading")}</p>
      <p className="text-sm text-muted-ink mt-1 leading-relaxed">{t("body")}</p>
      <ul className="mt-3 flex flex-col gap-2 text-sm">
        <li>
          <a
            href="https://www.visitcyprus.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${SECTION.aegeanLink} min-h-[44px] inline-flex items-center`}
          >
            {t("visitCyprus")}
          </a>
        </li>
        <li>
          <a
            href={advisoryLinkForLocale(locale)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${SECTION.aegeanLink} min-h-[44px] inline-flex items-center`}
          >
            {t("advisory")}
          </a>
        </li>
        <li className="text-muted-ink pt-1">{t("emergency")}</li>
      </ul>
    </aside>
  );
}
