"use client";

import { useEffect, useState } from "react";
import AppLink from "@/components/AppLink";
import { useLocale, hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { usePathname } from "@/i18n/navigation";
import { LAYER } from "@/lib/design-tokens";

const DISMISS_KEY = "cyprus-winter:locale-suggest-dismissed";

export type LocaleSuggestStrings = Record<
  string,
  { body: string; cta: string; dismiss: string; aria: string }
>;

/**
 * Wrong-locale suggestion (AUD-18): a deep link like /he/... is authoritative
 * under localePrefix "as-needed", so a visitor whose browser speaks another
 * supported language gets no hint the site speaks it too. Mount-gated (renders
 * nothing during SSR) so hydration never mismatches; dismissal sticks per
 * browser. Fixed just below the nav (pages pad only for the nav itself), at
 * the popover layer — dismissible, never focus-trapping.
 *
 * The bar addresses a visitor who reads the TARGET language, not the page's
 * current one — so `strings` carries every locale's own catalog copy
 * (`common.localeSuggest`, assembled server-side in the root layout) and is
 * rendered under the lang/dir of the target.
 */
export default function LocaleSuggestionBar({ strings }: { strings: LocaleSuggestStrings }) {
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
  const s = strings[target];
  if (!s) return null;

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
      aria-label={s.aria}
      lang={target}
      dir={target === "he" ? "rtl" : "ltr"}
      className={`fixed left-0 right-0 top-[calc(3.5rem+env(safe-area-inset-top,0px))] ${LAYER.popover} border-b border-sand-200/80 bg-sand-100/95 px-4 py-1 shadow-sm backdrop-blur-sm`}
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-olive">
        <span>{s.body}</span>
        <AppLink
          href={pathname || "/"}
          locale={target}
          onClick={dismiss}
          className="min-h-[44px] inline-flex items-center rounded px-2 py-1 font-medium text-aegean underline underline-offset-2 hover:text-aegean/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50"
        >
          {s.cta}
        </AppLink>
        <button
          type="button"
          onClick={dismiss}
          className="min-h-[44px] inline-flex items-center rounded px-2 py-1 text-muted-ink hover:text-terracotta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50"
        >
          {s.dismiss}
        </button>
      </div>
    </div>
  );
}
