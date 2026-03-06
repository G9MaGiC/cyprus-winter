"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive } from "@/lib/nav";
import { bottomOverflowLinks, bottomPrimaryLinks } from "@/lib/nav-links";

export default function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const isOverflowActive = bottomOverflowLinks.some((l) => isActive(pathname, l.href));

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
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-charcoal/96 backdrop-blur-xl border-t border-white/5 pb-[env(safe-area-inset-bottom)] pt-2 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {bottomPrimaryLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive(pathname, link.href) ? "page" : undefined}
            className="flex flex-col items-center justify-center min-h-[48px] min-w-[44px] gap-0.5 py-2 px-1 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
          >
            <span
              className={`text-xs font-medium ${isActive(pathname, link.href) ? "text-golden" : "text-white/70"}`}
            >
              {link.label}
            </span>
          </Link>
        ))}
        <div className="relative" ref={moreRef}>
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            aria-haspopup="true"
            aria-label="More navigation"
            className={`flex flex-col items-center justify-center min-h-[48px] min-w-[44px] gap-0.5 py-2 px-1 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal ${
              isOverflowActive ? "text-golden" : "text-white/70"
            }`}
          >
            <span className="text-xs font-medium">More</span>
          </button>
          {moreOpen && (
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 min-w-[140px] py-2 rounded-lg bg-charcoal border border-white/10 shadow-xl"
              role="menu"
            >
              {bottomOverflowLinks.map((link) => (
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
