import AppLink from "@/components/AppLink";
import { routing } from "@/i18n/routing";

const localeNames: Record<string, string> = {
  en: "English",
  el: "Ελληνικά",
  de: "Deutsch",
  pl: "Polski",
};

/**
 * Simple locale links for the root layout footer.
 * Root layout does not have NextIntlClientProvider, so we use plain links to /en, /de, etc.
 */
export default function LocaleLinks() {
  return (
    <div className="mt-4">
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        {routing.locales.map((locale) => (
          <AppLink
            key={locale}
            href={`/${locale}`}
            className="text-sm font-medium text-olive/70 hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-1 rounded px-2 py-1 min-h-[44px] inline-flex items-center"
          >
            {localeNames[locale] || locale}
          </AppLink>
        ))}
      </div>
    </div>
  );
}
