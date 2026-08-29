"use client";

import AppLink from "@/components/AppLink";
import { useLocale, useTranslations } from "next-intl";
import { isBetaLocale, routing } from "@/i18n/routing";
import { usePathname } from "@/i18n/navigation";

const localeNames: Record<string, string> = {
  en: "English",
  el: "Ελληνικά",
  de: "Deutsch",
  pl: "Polski",
  ro: "Română",
  fr: "Français",
  he: "עברית",
};

/**
 * Locale switcher links. Uses pathname without locale + explicit locale prop
 * so next-intl produces correct URLs (/en, /el/..., not /el/en).
 */
export default function LocaleLinks() {
  const pathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations("common");

  return (
    <div className="mt-4">
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        {routing.locales.map((locale) => {
          const name = localeNames[locale] || locale;
          const label = isBetaLocale(locale) ? `${name} (${t("localeBeta")})` : name;
          return (
            <AppLink
              key={locale}
              href={pathname || "/"}
              locale={locale}
              aria-current={locale === currentLocale ? "page" : undefined}
              aria-label={label}
              className={`text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-1 rounded px-2 py-1 min-h-[44px] inline-flex items-center ${locale === currentLocale ? "text-terracotta bg-terracotta/10" : "text-muted-ink hover:text-terracotta"}`}
            >
              {name}
              {isBetaLocale(locale) ? (
                <span className="ms-1 font-normal text-muted-ink">({t("localeBeta")})</span>
              ) : null}
            </AppLink>
          );
        })}
      </div>
    </div>
  );
}
