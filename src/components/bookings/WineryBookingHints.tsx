"use client";

import { useTranslations } from "next-intl";

type WineryBookingHintsProps = {
  openingHours?: string;
  bestTimeToVisit?: string;
};

/** P1-05: appointment / winter hours on book form */
export default function WineryBookingHints({
  openingHours,
  bestTimeToVisit,
}: WineryBookingHintsProps) {
  const t = useTranslations("book.wineryForm");

  return (
    <div className="rounded-lg border border-aegean/25 bg-aegean/5 p-4 space-y-2 text-sm text-olive/85">
      <p className="font-medium text-aegean">{t("hints.heading")}</p>
      {openingHours && (
        <p className="break-words">
          <span className="text-muted-ink">{t("hints.hoursLabel")}</span> {openingHours}
        </p>
      )}
      {bestTimeToVisit && (
        <p className="break-words">
          <span className="text-muted-ink">{t("hints.bestTimeLabel")}</span> {bestTimeToVisit}
        </p>
      )}
      <p className="text-muted-ink break-words">{t("hints.offSeasonHours")}</p>
    </div>
  );
}
