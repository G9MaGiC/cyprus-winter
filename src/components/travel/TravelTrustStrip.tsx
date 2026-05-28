"use client";

import { SECTION, TYPE } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

/** Calm official-travel links (P0-02). */
export default function TravelTrustStrip({ className = "" }: { className?: string }) {
  const t = useTranslations("travelTrust");

  return (
    <aside
      className={`rounded-2xl border border-sand-200/80 bg-sand-100/40 px-4 py-4 sm:px-5 sm:py-5 ${className}`}
      aria-label={t("aria")}
    >
      <p className={`${TYPE.kicker} text-olive/70`}>{t("heading")}</p>
      <p className="text-sm text-olive/80 mt-1 leading-relaxed">{t("body")}</p>
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
            href="https://www.gov.uk/foreign-travel-advice/cyprus"
            target="_blank"
            rel="noopener noreferrer"
            className={`${SECTION.aegeanLink} min-h-[44px] inline-flex items-center`}
          >
            {t("foreignTravelUk")}
          </a>
        </li>
        <li className="text-olive/70 pt-1">{t("emergency")}</li>
      </ul>
    </aside>
  );
}
