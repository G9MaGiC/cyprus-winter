"use client";

import { routing } from "@/i18n/routing";

interface LocaleSelectorProps {
  variant?: "default" | "footer" | "mobile";
}

export default function LocaleSelector({ variant = "default" }: LocaleSelectorProps) {
  // For now, this is a placeholder that shows the available locales
  // When full i18n routing is implemented, this will navigate to localized routes
  const currentLocale = routing.defaultLocale;

  const baseClasses = "text-sm font-medium rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/50";
  
  const variantClasses = {
    default: "px-3 py-1.5 bg-sand-200 hover:bg-sand-300 text-olive",
    footer: "px-2 py-1 text-olive/70 hover:text-olive bg-transparent hover:bg-sand-200/50",
    mobile: "px-4 py-2 bg-sand-100 hover:bg-sand-200 text-olive w-full text-center",
  };

  const localeNames: Record<string, string> = {
    en: "English",
    el: "Ελληνικά",
    de: "Deutsch",
    pl: "Polski",
  };

  return (
    <div className={`flex items-center gap-2 ${variant === "footer" ? "mt-4" : ""}`}>
      <span className="text-xs text-olive/60 sr-only">Language:</span>
      <select
        value={currentLocale}
        disabled
        className={`${baseClasses} ${variantClasses[variant]} appearance-none cursor-not-allowed bg-no-repeat bg-right pr-8 pl-3 opacity-60`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundSize: "16px",
          backgroundPosition: "right 8px center",
        }}
        aria-label="Select language (coming soon)"
        title="Multilingual support coming soon"
      >
        {routing.locales.map((locale) => (
          <option key={locale} value={locale}>
            {localeNames[locale] || locale}
          </option>
        ))}
      </select>
    </div>
  );
}
