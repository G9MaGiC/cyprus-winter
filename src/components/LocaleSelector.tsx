"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useTranslations } from "next-intl";

interface LocaleSelectorProps {
  variant?: "default" | "footer" | "mobile";
}

export default function LocaleSelector({ variant = "default" }: LocaleSelectorProps) {
  const locale = useLocale();
  const tCommon = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();

  const baseClasses =
    "text-sm font-medium rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/50";
  const variantClasses = {
    default: "px-3 py-1.5 min-h-[44px] bg-sand-200 hover:bg-sand-300 text-olive",
    footer: "px-3 py-2 min-h-[44px] text-olive/70 hover:text-olive bg-transparent hover:bg-sand-200/50",
    mobile: "px-4 py-2 min-h-[44px] bg-sand-100 hover:bg-sand-200 text-olive w-full text-center",
  };

  const localeNames: Record<string, string> = {
    en: "English",
    el: "Ελληνικά",
    de: "Deutsch",
    pl: "Polski",
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value as (typeof routing.locales)[number];
    if (routing.locales.includes(newLocale)) {
      router.replace(pathname, { locale: newLocale });
    }
  };

  return (
    <div className={`flex items-center gap-2 ${variant === "footer" ? "mt-4" : ""}`}>
      <span className="text-xs text-olive/60 sr-only">{tCommon("languageLabel")}</span>
      <select
        value={locale}
        onChange={handleChange}
        className={`${baseClasses} ${variantClasses[variant]} appearance-none cursor-pointer bg-no-repeat bg-right pr-8 pl-3`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundSize: "16px",
          backgroundPosition: "right 8px center",
        }}
        aria-label={tCommon("aria.selectLanguage")}
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {localeNames[loc] || loc}
          </option>
        ))}
      </select>
    </div>
  );
}
