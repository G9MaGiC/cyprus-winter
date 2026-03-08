"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive } from "@/lib/nav";
import { bottomOverflowLinks, bottomPrimaryLinks } from "@/lib/nav-links";
import { useStickyPlanBar } from "@/contexts/StickyPlanBarContext";
import { useAuth } from "@/contexts/AuthContext";

export default function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
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
            aria-current={isActive(pathname, link.href) ? "page" : undefined}
            className="flex flex-col items-center justify-center min-h-[52px] min-w-[48px] gap-0.5 py-3 px-2 rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal active:bg-white/5"
          >
            <span
              className={`text-xs max-[400px]:text-[11px] font-medium ${isActive(pathname, link.href) ? "text-golden" : "text-white/80"}`}
            >
              {link.label}
            </span>
          </Link>
        ))}
        {planLink && (
          <Link
            key={planLink.href}
            href={planLink.href}
            aria-current={isActive(pathname, planLink.href) ? "page" : undefined}
            aria-hidden={stickyPlanVisible}
            tabIndex={stickyPlanVisible ? -1 : undefined}
            className={`flex flex-col items-center justify-center min-h-[52px] min-w-[48px] gap-0.5 py-3 px-2 rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal active:bg-white/5 ${
              stickyPlanVisible ? "invisible pointer-events-none" : ""
            }`}
          >
            <span
              className={`text-xs max-[400px]:text-[11px] font-medium ${isActive(pathname, planLink.href) ? "text-golden" : "text-white/80"}`}
            >
              {planLink.label}
            </span>
          </Link>
        )}
        <div className="relative" ref={moreRef}>
          <button
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
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 min-w-[140px] py-2 rounded-xl bg-charcoal/98 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-sm"
              role="menu"
            >
              {overflowLinksResolved.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
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
