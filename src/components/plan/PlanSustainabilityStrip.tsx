"use client";

import AppLink from "@/components/AppLink";
import { SECTION, TYPE } from "@/lib/design-tokens";
import { getPlanSustainabilityLinks } from "@/lib/plan-sustainability";
import { useTranslations } from "next-intl";

export default function PlanSustainabilityStrip({ className = "" }: { className?: string }) {
  const t = useTranslations("plan.sustainability");
  const links = getPlanSustainabilityLinks();

  return (
    <aside
      className={`rounded-2xl border border-sand-200/80 bg-sand-100/40 px-4 py-4 sm:px-5 sm:py-5 ${className}`}
      aria-label={t("aria")}
    >
      <p className={`${TYPE.kicker} text-muted-ink`}>{t("heading")}</p>
      <p className="text-sm text-muted-ink mt-1 leading-relaxed">{t("body")}</p>
      <ul className="mt-3 flex flex-col gap-2 text-sm">
        {links.map((link) => (
          <li key={link.id}>
            <AppLink href={link.href} className={`${SECTION.aegeanLink} min-h-[44px] inline-flex items-center`}>
              {t(link.id)}
            </AppLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
