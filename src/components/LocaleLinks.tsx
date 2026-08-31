"use client";

import AppLink from "@/components/AppLink";
import { useLocale, useTranslations } from "next-intl";
import { isBetaLocale, routing } from "@/i18n/routing";
import { usePathname } from "@/i18n/navigation";

export const localeNames: Record<string, string> = {
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
 *
 * variant="menu" restyles for the dark nav menus (AUD-18: the switcher was
 * footer-only — up to ~23k px of scroll away on long hubs).
 */
export default function LocaleLinks({
  variant = "footer",
  onNavigate,
}: {
  variant?: "footer" | "menu";
  /** Called when a locale link is activated (menus close themselves with it). */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations("common");
  const menu = variant === "menu";

  const linkBase =
    "text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 rounded px-2 py-1 min-h-[44px] inline-flex items-center";
  const linkTheme = menu
    ? "focus-visible:ring-golden/50 focus-visible:ring-offset-charcoal"
    : "focus-visible:ring-terracotta/50";
  const activeClass = menu
    ? "text-golden bg-white/10"
    : "text-terracotta-muted bg-terracotta/10";
  const idleClass = menu
    ? "text-white/80 hover:text-golden"
    : "text-muted-ink hover:text-terracotta";

  return (
    <div className={menu ? "" : "mt-4"}>
      <div className={`flex flex-wrap gap-x-3 gap-y-1 ${menu ? "" : "justify-center"}`}>
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
              onClick={onNavigate}
              className={`${linkBase} ${linkTheme} ${locale === currentLocale ? activeClass : idleClass}`}
            >
              {name}
              {isBetaLocale(locale) ? (
                <span className="ms-1 font-normal">({t("localeBeta")})</span>
              ) : null}
            </AppLink>
          );
        })}
      </div>
      <p className={`mt-2 text-xs ${menu ? "text-white/60" : "text-center text-muted-ink"}`}>
        {t("localeBetaHint")}
      </p>
    </div>
  );
}
