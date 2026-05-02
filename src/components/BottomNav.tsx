"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { isActive } from "@/lib/nav";
import { bottomOverflowLinks, bottomPrimaryLinks } from "@/lib/nav-links";
import { useStickyPlanBar } from "@/contexts/StickyPlanBarContext";
import { useAuth } from "@/contexts/AuthContext";

export default function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreTriggerRef = useRef<HTMLButtonElement>(null);
  const firstMenuItemRef = useRef<HTMLAnchorElement>(null);
  const { stickyPlanVisible } = useStickyPlanBar();
  const { user } = useAuth();
  const overflowLinksResolved = useMemo(
    () =>
      bottomOverflowLinks.map((l) =>
        l.href === "/account" && !user
          ? { href: "/login", label: "Sign in" }
          : l
      ),
    [user]
  );

  const planLink = bottomPrimaryLinks.find((l) => l.href === "/plan");
  const otherLinks = bottomPrimaryLinks.filter((l) => l.href !== "/plan");
  const isOverflowActive = overflowLinksResolved.some((l) => isActive(pathname, l.href));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    if (moreOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [moreOpen]);

  useEffect(() => {
    if (!moreOpen) return;
    requestAnimationFrame(() => firstMenuItemRef.current?.focus());
  }, [moreOpen]);

  return (
    <nav
      role="navigation"
      aria-label="Bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-charcoal/97 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.12)] pb-[env(safe-area-inset-bottom)] pt-3 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {otherLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            prefetch="auto"
            aria-current={isActive(pathname, link.href) ? "page" : undefined}
            className="flex flex-col items-center justify-center min-h-[52px] min-w-[48px] gap-0.5 py-3 px-2 rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal active:bg-white/5"
          >
            <span
              title={link.label}
              className={`text-xs max-[400px]:text-[11px] font-medium max-w-[64px] truncate text-center ${isActive(pathname, link.href) ? "text-golden" : "text-white/80"}`}
            >
              {link.label}
            </span>
          </Link>
        ))}
        {planLink &&
          (stickyPlanVisible ? (
            <div
              className="flex flex-col items-center justify-center min-h-[52px] min-w-[48px] py-3 px-2 pointer-events-none select-none"
              aria-hidden
            >
              <span className="text-xs max-[400px]:text-[11px] font-medium max-w-[64px] truncate text-center invisible">
                {planLink.label}
              </span>
            </div>
          ) : (
            <Link
              key={planLink.href}
              href={planLink.href}
              prefetch="auto"
              aria-current={isActive(pathname, planLink.href) ? "page" : undefined}
              className="flex flex-col items-center justify-center min-h-[52px] min-w-[48px] gap-0.5 py-3 px-2 rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal active:bg-white/5"
            >
              <span
                title={planLink.label}
                className={`text-xs max-[400px]:text-[11px] font-medium max-w-[64px] truncate text-center ${isActive(pathname, planLink.href) ? "text-golden" : "text-white/80"}`}
              >
                {planLink.label}
              </span>
            </Link>
          ))}
        <div className="relative" ref={moreRef}>
          <button
            ref={moreTriggerRef}
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            aria-haspopup="true"
            aria-label="More navigation"
            className={`flex flex-col items-center justify-center min-h-[52px] min-w-[48px] gap-0.5 py-3 px-2 rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal active:bg-white/5 ${
              isOverflowActive ? "text-golden" : "text-white/80"
            }`}
          >
            <span className="text-xs max-[400px]:text-[11px] font-medium">More</span>
          </button>
          {moreOpen && (
            <div
              className="absolute bottom-full right-0 mb-2 w-[min(16rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] py-2 rounded-xl bg-charcoal/98 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-sm"
              role="menu"
              onKeyDown={(e) => {
                if (e.key !== "Escape") return;
                e.preventDefault();
                setMoreOpen(false);
                requestAnimationFrame(() => moreTriggerRef.current?.focus());
              }}
            >
              {overflowLinksResolved.map((link, idx) => (
                <Link
                  key={link.href}
                  ref={idx === 0 ? firstMenuItemRef : undefined}
                  href={link.href}
                  prefetch="auto"
                  onClick={() => setMoreOpen(false)}
                  role="menuitem"
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                  className="block min-h-[44px] px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 rounded mx-1"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
