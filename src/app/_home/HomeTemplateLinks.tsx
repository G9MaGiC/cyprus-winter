import "server-only";

import AppLink from "@/components/AppLink";
import { CTA, TYPE } from "@/lib/design-tokens";
import { getTranslations } from "next-intl/server";

const TEMPLATE_KEYS = ["short-stay", "classic", "classic-7", "mountain-10"] as const;

const TEMPLATE_HREFS: Record<(typeof TEMPLATE_KEYS)[number], string> = {
  "short-stay": "/plan?template=short-stay",
  classic: "/plan?template=classic",
  "classic-7": "/plan?template=classic-7",
  "mountain-10": "/plan?template=mountain-10",
};

type Props = { locale?: string };

export default async function HomeTemplateLinks({ locale }: Props) {
  const t = locale
    ? await getTranslations({ locale, namespace: "home" })
    : await getTranslations("home");

  return (
    <section aria-labelledby="templates-heading">
      <header className="mb-4 sm:mb-5">
        <p id="templates-heading" className={`${TYPE.kicker} text-sage mb-2`}>
          {t("templates.kicker")}
        </p>
        <p className="text-sm text-olive/70">{t("templates.subtitle")}</p>
      </header>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {TEMPLATE_KEYS.map((key) => (
          <AppLink
            key={key}
            href={TEMPLATE_HREFS[key]}
            className={`inline-flex flex-col sm:flex-row sm:items-center sm:gap-2 min-h-[44px] px-4 py-2.5 rounded-xl border border-sand-200/80 text-olive font-medium hover:border-terracotta/40 hover:text-terracotta hover:bg-terracotta/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
          >
            <span>{t(`templates.items.${key}.label`)}</span>
            <span className="text-xs text-olive/60 font-normal">
              {t(`templates.items.${key}.hint`)}
            </span>
          </AppLink>
        ))}
        <AppLink href="/plan" className={CTA.chipTertiary}>
          {t("templates.allTemplates")}
        </AppLink>
      </div>
    </section>
  );
}
