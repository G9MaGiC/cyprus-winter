"use client";

/**
 * Breadcrumb navigation for better wayfinding
 * Shows path from home to current page
 */

import AppLink from "@/components/AppLink";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { getPathWithoutLocale } from "@/lib/nav";

type BreadcrumbItem = {
  label: string;
  href: string;
  isCurrent?: boolean;
};

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// Auto-generate breadcrumbs based on pathname
function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  
  const normalized = getPathWithoutLocale(pathname);
  const segments = normalized.split("/").filter(Boolean);
  
  // Map of path segments to readable labels
  const labelMap: Record<string, string> = {
    discover: tNav("discover"),
    trails: tNav("trails"),
    plan: tNav("plan"),
    bookings: tNav("bookings"),
    weather: tNav("weather"),
    events: tNav("events"),
    airport: tNav("airport"),
    team: tNav("team"),
    account: tNav("account"),
    login: tNav("signIn"),
    search: tNav("search"),
    secrets: tNav("secrets"),
    // Non-nav segments (keep English for now unless we add message keys)
    register: "Create account",
    "forgot-password": "Reset password",
    "reset-password": "Set new password",
    book: "Book",
    guide: "Guided hike",
    "wine-routes": "Wine Routes",
    regions: "Regions",
    "troodos-december": "Troodos December Guide",
    install: "Install App",
  };
  
  const items: BreadcrumbItem[] = [{ label: tNav("home"), href: "/" }];
  
  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    // Skip IDs (they're usually the last segment and we don't have the name)
    const isId = index === segments.length - 1 && !labelMap[segment];
    
    if (!isId) {
      items.push({
        label: labelMap[segment] || segment.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        href: currentPath,
        isCurrent: index === segments.length - 1,
      });
    }
  });
  
  return items;
}

export default function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const autoItems = useBreadcrumbs();
  const breadcrumbItems = items || autoItems;
  
  // Don't show on home page
  if (breadcrumbItems.length <= 1) return null;
  
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("py-3 px-4 sm:px-6", className)}
    >
      <ol className="flex flex-wrap items-center gap-2 text-sm text-olive/60">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <li key={item.href} className="flex items-center gap-2">
              {index > 0 && (
                <span aria-hidden className="text-olive/30">/</span>
              )}
              {isLast ? (
                <span
                  className="font-medium text-olive"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <AppLink
                  href={item.href}
                  className="min-h-[44px] py-2 inline-flex items-center hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 rounded px-1 -mx-1"
                >
                  {item.label}
                </AppLink>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
