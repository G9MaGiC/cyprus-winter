"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { triggerAIAssistant } from "./AIAssistantTrigger";
import { LAYOUT } from "@/lib/design-tokens";
import { isActive } from "@/lib/nav";
import { navMoreLinks, navPrimaryLinks } from "@/lib/nav-links";
import { useAuth } from "@/contexts/AuthContext";

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { user } = useAuth();
  const moreLinksResolved = useMemo(
    () =>
      navMoreLinks.map((l) =>
        l.href === "/account" && !user
          ? { href: "/login", label: "Sign in" }
          : l
      ),
    [user]
  );
  const allLinks = [...navPrimaryLinks, ...moreLinksResolved];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMoreOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-charcoal/96 backdrop-blur-xl border-b border-white/5 pt-[env(safe-area-inset-top)]">
      <div className={`${LAYOUT.nav} mx-auto flex items-center justify-between h-14 ${LAYOUT.safeAreaX}`}>
        <Link href="/" className="font-display text-xl font-bold text-golden min-h-[44px] inline-flex items-center">
          Cyprus Winter
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/search"
            className="inline-flex items-center min-h-[44px] px-3 py-2 rounded-lg text-white/80 hover:text-golden transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
            aria-label="Search places and trails"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>
          {navPrimaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              className={`text-sm font-medium transition-colors min-h-[44px] inline-flex items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal ${
                isActive(pathname, link.href)
                  ? "text-golden"
                  : "text-white/80 hover:text-golden"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen(!moreOpen)}
              aria-expanded={moreOpen}
              aria-haspopup="true"
              aria-controls="more-menu"
              className={`inline-flex items-center min-h-[44px] min-w-[44px] justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal ${
                moreLinksResolved.some((l) => isActive(pathname, l.href))
                  ? "text-golden"
                  : "text-white/80 hover:text-golden"
              }`}
            >
              More
            </button>
            {moreOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMoreOpen(false)}
                  aria-hidden
                  tabIndex={-1}
                />
                <div id="more-menu" className="absolute right-0 top-full mt-1 py-2 rounded-lg bg-charcoal border border-terracotta/10 shadow-xl z-50 min-w-[120px]">
                  {moreLinksResolved.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={isActive(pathname, link.href) ? "page" : undefined}
                      onClick={() => setMoreOpen(false)}
                      className={`block min-h-[44px] px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal rounded ${
                        isActive(pathname, link.href) ? "text-golden" : "text-white/90 hover:text-golden"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => triggerAIAssistant()}
            className="inline-flex items-center min-h-[44px] px-4 py-2 rounded-lg bg-golden text-charcoal text-sm font-semibold hover:bg-golden/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
            aria-label="Ask AI for trails, wineries, and trip ideas"
          >
            Ask AI
          </button>
        </div>

        {/* Mobile menu button — 44px min touch target */}
        <button
          type="button"
          className="md:hidden min-h-[44px] min-w-[44px] p-3 flex items-center justify-center text-white rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
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
        <div className="md:hidden border-t border-terracotta/10 bg-charcoal/98 py-4 pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] flex flex-col gap-2">
          <Link
            href="/search"
            onClick={() => setOpen(false)}
            className="min-h-[44px] flex items-center py-3 font-medium text-golden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal rounded"
          >
            Search
          </Link>
          <button
            type="button"
            onClick={() => { triggerAIAssistant(); setOpen(false); }}
            className="min-h-[44px] flex items-center py-3 font-medium text-golden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal rounded"
            aria-label="Ask AI for trails, wineries, and trip ideas"
          >
            Ask AI
          </button>
          {allLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              onClick={() => setOpen(false)}
              className={`min-h-[44px] flex items-center py-3 font-medium break-words focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal rounded ${
                isActive(pathname, link.href) ? "text-golden" : "text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
