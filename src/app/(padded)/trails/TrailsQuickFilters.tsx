"use client";

import AppLink from "@/components/AppLink";
import { useTranslations } from "next-intl";

export default function TrailsQuickFilters() {
  const t = useTranslations("trails");

  const QUICK_CHIPS = [
    { id: "short-easy", label: t("quickFilters.chips.shortEasy"), href: "/trails?difficulty=easy" },
    { id: "open", label: t("quickFilters.chips.openToday"), href: "/trails?status=open" },
    { id: "winter", label: t("quickFilters.chips.winterHighlights"), href: "/trails?region=Troodos" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="prose-label text-olive/60 mr-1">{t("quickFilters.label")}</span>
      {QUICK_CHIPS.map((chip) => (
        <AppLink
          key={chip.id}
          href={chip.href}
          className="px-3 py-2 rounded-lg text-sm font-medium border border-sand-200/80 text-olive/80 hover:border-terracotta/30 hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {chip.label}
        </AppLink>
      ))}
    </div>
  );
}
