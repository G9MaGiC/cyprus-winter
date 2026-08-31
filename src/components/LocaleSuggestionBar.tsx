"use client";

import { useEffect, useState } from "react";
import AppLink from "@/components/AppLink";
import { useLocale, hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { usePathname } from "@/i18n/navigation";
import { LAYER } from "@/lib/design-tokens";

const DISMISS_KEY = "cyprus-winter:locale-suggest-dismissed";

/**
 * The bar addresses a visitor who reads the TARGET language, not the page's
 * current one — so its copy is a per-locale map rendered under lang/dir of
 * the target, not a lookup in the current locale's catalog (which the
 * visitor may not read). Values follow the shipped catalogs' registers.
 */
const SUGGEST_STRINGS: Record<string, { body: string; cta: string; dismiss: string; aria: string }> = {
  en: { body: "This page is also available in English.", cta: "Switch to English", dismiss: "Dismiss", aria: "Language suggestion" },
  el: { body: "Αυτή η σελίδα είναι διαθέσιμη και στα Ελληνικά.", cta: "Αλλαγή στα Ελληνικά", dismiss: "Κλείσιμο", aria: "Πρόταση γλώσσας" },
  de: { body: "Diese Seite gibt es auch auf Deutsch.", cta: "Zu Deutsch wechseln", dismiss: "Ausblenden", aria: "Sprachvorschlag" },
  pl: { body: "Ta strona jest dostępna także po polsku.", cta: "Przełącz na polski", dismiss: "Zamknij", aria: "Propozycja języka" },
  fr: { body: "Cette page est aussi disponible en français.", cta: "Passer au français", dismiss: "Fermer", aria: "Suggestion de langue" },
  he: { body: "העמוד הזה זמין גם בעברית.", cta: "מעבר לעברית", dismiss: "סגירה", aria: "הצעת שפה" },
  ro: { body: "Această pagină este disponibilă și în română.", cta: "Treci la română", dismiss: "Închide", aria: "Sugestie de limbă" },
};

/**
 * Wrong-locale suggestion (AUD-18): a deep link like /he/... is authoritative
 * under localePrefix "as-needed", so a visitor whose browser speaks another
 * supported language gets no hint the site speaks it too. Mount-gated (renders
 * nothing during SSR) so hydration never mismatches; dismissal sticks per
 * browser. Fixed just below the nav (pages pad only for the nav itself), at
 * the popover layer — dismissible, never focus-trapping.
 */
export default function LocaleSuggestionBar() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      return;
    }
    const primary = (navigator.language || "").split("-")[0]?.toLowerCase();
    if (!primary || primary === currentLocale) return;
    if (!hasLocale(routing.locales, primary)) return;
    setTarget(primary);
  }, [currentLocale]);

  if (!target) return null;
  const strings = SUGGEST_STRINGS[target];
  if (!strings) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // storage unavailable — dismiss for this view only
    }
    setTarget(null);
  };

  return (
    <div
      role="region"
      aria-label={strings.aria}
      lang={target}
      dir={target === "he" ? "rtl" : "ltr"}
      className={`fixed left-0 right-0 top-[calc(3.5rem+env(safe-area-inset-top,0px))] ${LAYER.popover} border-b border-sand-200/80 bg-sand-100/95 px-4 py-1 shadow-sm backdrop-blur-sm`}
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-olive">
        <span>{strings.body}</span>
        <AppLink
          href={pathname || "/"}
          locale={target}
          onClick={dismiss}
          className="min-h-[44px] inline-flex items-center rounded px-2 py-1 font-medium text-aegean underline underline-offset-2 hover:text-aegean/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50"
        >
          {strings.cta}
        </AppLink>
        <button
          type="button"
          onClick={dismiss}
          className="min-h-[44px] inline-flex items-center rounded px-2 py-1 text-muted-ink hover:text-terracotta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50"
        >
          {strings.dismiss}
        </button>
      </div>
    </div>
  );
}
