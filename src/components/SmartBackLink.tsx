"use client";

/**
 * Smart back button that preserves context
 * Shows "Back to results" if coming from search/discover
 * Otherwise shows generic back
 */

import AppLink from "@/components/AppLink";
import { useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { createDetailLink } from "@/lib/discover-links";

export { createDetailLink };

interface SmartBackLinkProps {
  fallbackHref?: string;
  fallbackLabel?: string;
  className?: string;
}

export default function SmartBackLink({
  fallbackHref = "/",
  fallbackLabel = "Back",
  className,
}: SmartBackLinkProps) {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // Check if we came from a specific page
  const from = searchParams.get("from");
  const query = searchParams.get("q");
  
  let href = fallbackHref;
  let label = fallbackLabel === "Back" ? tCommon("back") : fallbackLabel;
  
  if (from === "search" && query) {
    href = `/search?q=${encodeURIComponent(query)}`;
    label = tCommon("backTo", { label: `“${query}”` });
  } else if (from === "discover") {
    const filterParam = searchParams.get("filter");
    href = filterParam
      ? `/discover?filter=${encodeURIComponent(filterParam)}`
      : "/discover";
    label = tCommon("backTo", { label: tNav("discover") });
  } else if (from === "plan") {
    href = "/plan";
    label = tCommon("backTo", { label: tNav("plan") });
  } else if (from === "trails") {
    href = "/trails";
    label = tCommon("backTo", { label: tNav("trails") });
  } else if (from === "wineries") {
    href = "/wineries";
    label = tCommon("backTo", { label: tNav("wineries") });
  } else if (from === "book") {
    href = "/book/winery";
    label = tCommon("backTo", { label: tCommon("breadcrumbs.bookTasting") });
  } else if (from === "bookings") {
    href = "/bookings";
    label = tCommon("backTo", { label: tNav("bookings") });
  } else if (from === "home") {
    href = "/";
    label = tCommon("backTo", { label: tNav("home") });
  }
  
  // Don't show if we're at the root
  if (pathname === "/") return null;

  return (
    <AppLink
      href={href}
      className={cn(
        "inline-flex items-center gap-1 text-sm text-olive/70 hover:text-terracotta transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 rounded px-2 -mx-2 min-h-[44px] py-2",
        className
      )}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span className="truncate max-w-[200px]">{label}</span>
    </AppLink>
  );
}
