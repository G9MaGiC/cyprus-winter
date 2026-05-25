"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import AppLink from "@/components/AppLink";
import { usePathname } from "next/navigation";
import { isActive } from "@/lib/nav";
import { bottomOverflowLinks, bottomPrimaryLinks } from "@/lib/nav-links";
import { useStickyPlanBar } from "@/contexts/StickyPlanBarContext";
import { useAuth } from "@/contexts/AuthContext";

export default function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const { stickyPlanVisible } = useStickyPlanBar();
  const { user } = useAuth();
  const overflowLinksResolved = useMemo(
    () =>
      bottomOverflowLinks.map((l) =>
        l.href === "/account" && !user
          ? { href: "/login", labelKey: "signIn" as const }
          : l
      ),
    [user]
  );

  const planLink = bottomPrimaryLinks.find((l) => l.href === "/plan");
  const otherLinks = bottomPrimaryLinks.filter((l) => l.href !== "/plan");
  const isOverflowActive = overflowLinksResolved.some((l) =>
    isActive(pathname, l.href)
  );

  const closeMore = useCallback(() => {
    setMoreOpen(false);
    moreButtonRef.current?.focus?.();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        closeMore();
      }
    };
    if (moreOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [moreOpen, closeMore]);

  useEffect(() => {
    if (!moreOpen) return;
    const menu = moreMenuRef.current;
    if (!menu) return;
    const focusables = menu.querySelectorAll<HTMLElement>('a[href], button');
    if (focusables.length === 0) return;
    (focusables[0] as HTMLElement).focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMore();
        return;
      }
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

    menu.addEventListener("keydown", onKeyDown);
    return () => menu.removeEventListener("keydown", onKeyDown);
  }, [moreOpen, closeMore]);

  return (
    <nav
      role="navigation"
      aria-label={tCommon("aria.bottomNavigation")}
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-charcoal/97 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.12)] pb-[env(safe-area-inset-bottom)] pt-3 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {otherLinks.map((link) => (
          <AppLink
            key={link.href}
            href={link.href}
            prefetch={false}
            aria-current={isActive(pathname, link.href) ? "page" : undefined}
            className="flex flex-col items-center justify-center min-h-[52px] min-w-[44px] gap-0.5 py-3 px-1.5 max-[375px]:px-1 sm:px-2 rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal active:bg-white/5"
          >
            <span
              className={`text-xs max-[400px]:text-[11px] font-medium whitespace-nowrap truncate max-w-[56px] text-center ${isActive(pathname, link.href) ? "text-golden" : "text-white/80"}`}
            >
              {t(link.labelKey)}
            </span>
            {isActive(pathname, link.href) && (
              <span className="w-1 h-1 rounded-full bg-golden mt-0.5" aria-hidden />
            )}
          </AppLink>
        ))}
        {planLink && (
          <AppLink
            key={planLink.href}
            href={planLink.href}
            prefetch={false}
            aria-current={isActive(pathname, planLink.href) ? "page" : undefined}
            aria-hidden={stickyPlanVisible}
            tabIndex={stickyPlanVisible ? -1 : undefined}
            className={`flex flex-col items-center justify-center min-h-[52px] min-w-[44px] gap-0.5 py-3 px-1.5 max-[375px]:px-1 sm:px-2 rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal active:bg-white/5 ${
              stickyPlanVisible ? "invisible pointer-events-none" : ""
            }`}
          >
            <span
              className={`text-xs max-[400px]:text-[11px] font-medium whitespace-nowrap truncate max-w-[56px] text-center ${isActive(pathname, planLink.href) ? "text-golden" : "text-white/80"}`}
            >
              {t(planLink.labelKey)}
            </span>
            {isActive(pathname, planLink.href) && (
              <span className="w-1 h-1 rounded-full bg-golden mt-0.5" aria-hidden />
            )}
          </AppLink>
        )}
        <div className="relative" ref={moreRef}>
          <button
            ref={moreButtonRef}
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            aria-haspopup="true"
            aria-label={tCommon("aria.moreNavigation")}
            className={`flex flex-col items-center justify-center min-h-[52px] min-w-[44px] gap-0.5 py-3 px-1.5 max-[375px]:px-1 sm:px-2 rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal active:bg-white/5 ${
              isOverflowActive ? "text-golden" : "text-white/80"
            }`}
          >
            <span className="text-xs max-[400px]:text-[11px] font-medium whitespace-nowrap">
              {t("more")}
            </span>
          </button>
          {moreOpen && (
            <div
              ref={moreMenuRef}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 min-w-[140px] py-2 rounded-xl bg-charcoal/98 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-sm"
              role="menu"
            >
              {overflowLinksResolved.map((link) => (
                <AppLink
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  onClick={closeMore}
                  role="menuitem"
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                  className="block min-h-[44px] px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 rounded mx-1"
                >
                  {t(link.labelKey)}
                </AppLink>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
