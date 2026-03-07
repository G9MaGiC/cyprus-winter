"use client";

/**
 * Smart back button that preserves context
 * Shows "Back to results" if coming from search/discover
 * Otherwise shows generic back
 */

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // Check if we came from a specific page
  const from = searchParams.get("from");
  const query = searchParams.get("q");
  
  let href = fallbackHref;
  let label = fallbackLabel;
  
  if (from === "search" && query) {
    href = `/search?q=${encodeURIComponent(query)}`;
    label = `Back to "${query}"`;
  } else if (from === "discover") {
    href = "/discover";
    label = "Back to Discover";
  } else if (from === "plan") {
    href = "/plan";
    label = "Back to Plan";
  } else if (from === "trails") {
    href = "/trails";
    label = "Back to Trails";
  }
  
  // Don't show if we're at the root
  if (pathname === "/") return null;

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1 text-sm text-olive/70 hover:text-terracotta transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 rounded px-2 -mx-2 py-1",
        className
      )}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span className="truncate max-w-[200px]">{label}</span>
    </Link>
  );
}

// Helper to add "from" parameter to links
export function createDetailLink(
  basePath: string,
  id: string,
  from?: string,
  query?: string
): string {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (query) params.set("q", query);
  
  const queryString = params.toString();
  return `${basePath}/${id}${queryString ? `?${queryString}` : ""}`;
}
