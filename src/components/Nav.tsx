"use client";

import AppLink from "@/components/AppLink";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { triggerAIAssistant } from "./AIAssistantTrigger";
import { LAYOUT, LAYER } from "@/lib/design-tokens";
import { isActive } from "@/lib/nav";
import { navMoreLinks, navPrimaryLinks } from "@/lib/nav-links";
import { useAuth } from "@/contexts/AuthContext";
import LocaleLinks from "@/components/LocaleLinks";

export default function Nav() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const closeMobileMenu = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => mobileMenuButtonRef.current?.focus());
  }, []);
  const { user } = useAuth();
  const moreLinksResolved = useMemo(
    () =>
      navMoreLinks.map((l) =>
        l.href === "/account" && !user
          ? { href: "/login", labelKey: "signIn" as const }
          : l
      ),
    [user]
  );
  const allLinks = [...navPrimaryLinks, ...moreLinksResolved];

  useEffect(() => {
    // Only act when one of our menus is actually open — an unconditional handler
    // steals focus from every modal's own Escape restore (BUG-358 / AUD-05).
    if (!open && !moreOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (open) closeMobileMenu();
        if (moreOpen) {
          setMoreOpen(false);
          requestAnimationFrame(() => moreButtonRef.current?.focus());
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeMobileMenu, open, moreOpen]);

  useEffect(() => {
    if (!moreOpen || !moreMenuRef.current) return;
    const menu = moreMenuRef.current;
    const focusables = menu.querySelectorAll<HTMLElement>('a[href], button');
    if (focusables.length === 0) return;
    (focusables[0] as HTMLElement).focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const first = focusables[0] as HTMLElement;
      const last = focusables[focusables.length - 1] as HTMLElement;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    menu.addEventListener("keydown", handleKeyDown);
    return () => menu.removeEventListener("keydown", handleKeyDown);
  }, [moreOpen]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open || !mobileMenuRef.current) return;
    const menu = mobileMenuRef.current;
    const focusables = menu.querySelectorAll<HTMLElement>('a[href], button');
    if (focusables.length === 0) return;
    (focusables[0] as HTMLElement).focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const first = focusables[0] as HTMLElement;
      const last = focusables[focusables.length - 1] as HTMLElement;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    menu.addEventListener("keydown", handleKeyDown);
    return () => menu.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <nav aria-label={t("mainNavigation")} className={`fixed top-0 left-0 right-0 ${LAYER.chrome} bg-charcoal/97 backdrop-blur-xl border-b border-white/10 shadow-[0_2px_16px_rgba(0,0,0,0.08)] pt-[env(safe-area-inset-top)]`}>
      <div className={`${LAYOUT.nav} mx-auto flex items-center justify-between h-14 ${LAYOUT.safeAreaX}`}>
        <AppLink
          href="/"
          prefetch={false}
          className="font-display text-xl font-bold text-golden min-h-[44px] inline-flex items-center"
        >
          Cyprus Winter
        </AppLink>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-3">
          <AppLink
            href="/search"
            prefetch={false}
            className="inline-flex items-center min-h-[44px] px-3 py-2 rounded-lg text-white/80 hover:text-golden transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
            aria-label={t("searchAria")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </AppLink>
          {navPrimaryLinks.filter((link) => link.href !== "/").map((link) => (
            <AppLink
              key={link.href}
              href={link.href}
              prefetch={false}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              className={`text-sm font-medium transition-colors min-h-[44px] inline-flex items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal ${
                isActive(pathname, link.href)
                  ? "text-golden"
                  : "text-white/80 hover:text-golden"
              }`}
            >
              {t(link.labelKey)}
            </AppLink>
          ))}
          <div className="relative">
            <button
              type="button"
              ref={moreButtonRef}
              onClick={() => setMoreOpen(!moreOpen)}
              aria-expanded={moreOpen}
              aria-controls="more-menu"
              className={`inline-flex items-center min-h-[44px] min-w-[44px] justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal ${
                moreLinksResolved.some((l) => isActive(pathname, l.href))
                  ? "text-golden"
                  : "text-white/80 hover:text-golden"
              }`}
            >
              {t("more")}
            </button>
            {moreOpen && (
              <>
                <div
                  className={`fixed inset-0 ${LAYER.chrome}`}
                  onClick={() => setMoreOpen(false)}
                  aria-hidden
                  tabIndex={-1}
                />
                {/* Disclosure of nav links, not a menu widget: links navigate,
                    there are no menuitem semantics to honor (AUD-27). */}
                <div id="more-menu" ref={moreMenuRef} className={`absolute end-0 top-full mt-1 py-2 rounded-lg bg-charcoal border border-terracotta/10 shadow-xl ${LAYER.popover} min-w-[260px]`}>
                  <ul>
                    {moreLinksResolved.map((link) => (
                      <li key={link.href}>
                        <AppLink
                          href={link.href}
                          prefetch={false}
                          aria-current={isActive(pathname, link.href) ? "page" : undefined}
                          onClick={() => setMoreOpen(false)}
                          className={`block min-h-[44px] px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal rounded ${
                            isActive(pathname, link.href) ? "text-golden" : "text-white/90 hover:text-golden"
                          }`}
                        >
                          {t(link.labelKey)}
                        </AppLink>
                      </li>
                    ))}
                  </ul>
                  {/* Locale switcher entry point — was footer-only (AUD-18/50). */}
                  <div className="mt-2 border-t border-white/10 px-4 pt-3 pb-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-1">
                      {tCommon("localeSwitchHeading")}
                    </p>
                    <LocaleLinks variant="menu" onNavigate={() => setMoreOpen(false)} />
                  </div>
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => triggerAIAssistant()}
            className="inline-flex items-center min-h-[44px] px-4 py-2 rounded-lg bg-golden text-charcoal text-sm font-semibold hover:bg-golden/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
            aria-label={t("askAIAria")}
          >
            {t("askAI")}
          </button>
        </div>

        {/* Mobile menu button — 44px min touch target */}
        <button
          ref={mobileMenuButtonRef}
          type="button"
          className="lg:hidden min-h-[44px] min-w-[44px] p-3 flex items-center justify-center text-white rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
          onClick={() => (open ? closeMobileMenu() : setOpen(true))}
          aria-label={open ? t("closeMenu") : t("openMenu")}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        /* Navigation panel (already inside the nav landmark) — role="menu"
           with zero menuitems was the AUD-27 misuse. */
        <div id="mobile-menu" ref={mobileMenuRef} className="lg:hidden border-t border-terracotta/10 bg-charcoal/98 py-4 pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] flex flex-col gap-2">
          <AppLink
            href="/search"
            prefetch={false}
            onClick={closeMobileMenu}
            className="min-h-[44px] flex items-center py-3 font-medium text-golden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal rounded"
          >
            {t("search")}
          </AppLink>
          <button
            type="button"
            onClick={() => { triggerAIAssistant(); setOpen(false); }}
            className="min-h-[44px] flex items-center py-3 font-medium text-golden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal rounded"
            aria-label={t("askAIAria")}
          >
            {t("askAI")}
          </button>
          <ul className="flex flex-col gap-2">
            {allLinks.map((link) => (
              <li key={link.href}>
                <AppLink
                  href={link.href}
                  prefetch={false}
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                  onClick={closeMobileMenu}
                  className={`min-h-[44px] flex items-center py-3 font-medium break-words focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal rounded ${
                    isActive(pathname, link.href) ? "text-golden" : "text-white"
                  }`}
                >
                  {t(link.labelKey)}
                </AppLink>
              </li>
            ))}
          </ul>
          {/* Locale switcher entry point — was footer-only (AUD-18/50). */}
          <div className="mt-3 border-t border-white/10 pt-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-1">
              {tCommon("localeSwitchHeading")}
            </p>
            <LocaleLinks variant="menu" onNavigate={closeMobileMenu} />
          </div>
        </div>
      )}
    </nav>
  );
}
