"use client";

import { useEffect, useState } from "react";
import AppLink from "@/components/AppLink";
import { usePathname } from "next/navigation";
import { useItinerary } from "@/hooks/useItinerary";
import { useTripDates } from "@/hooks/useTripDates";
import NavigateButton from "@/components/NavigateButton";
import { LAYOUT } from "@/lib/design-tokens";

/**
 * Sticky bar showing "Next up: [place]" with Navigate when user has an itinerary.
 * Shown on home, discover, trails — hidden on plan page.
 */
export default function NextOnPlanBar() {
  const pathname = usePathname();
  const { days, activeDay, hydrated, getPlace } = useItinerary();
  const { dates, hydrated: datesHydrated, daysUntil } = useTripDates();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  if (!mounted || !hydrated) return null;

  // Decide which day's first item to show: if trip is active, use "today" = Day 1 + daysUntil offset
  let displayDay = activeDay;
  if (datesHydrated && dates.start && daysUntil !== null && daysUntil <= 0) {
    const start = new Date(dates.start);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    const dayIndex = Math.floor((today.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    if (dayIndex >= 1) displayDay = dayIndex;
  }

  const ids = days[displayDay] ?? [];
  const firstId = ids[0];
  const place = firstId ? getPlace(firstId) : undefined;

  // Hide on plan page (they see full list), account, auth. Handles locale routes and localized pathnames.
  const planSegments = ["/plan", "/schedias", "/planen", "/planuj"];
  const authSegments = [
    "/account", "/logarias", "/konto", "/login", "/eisodos", "/anmelden", "/logowanie",
    "/register", "/eggrafi", "/registrieren", "/rejestracja",
    "/forgot-password", "/reset-password",
  ];
  const hideSegments = [...planSegments, ...authSegments];
  if (hideSegments.some((p) => pathname === p || pathname.endsWith(p))) return null;
  if (!place || ids.length === 0) return null;

  const href = place.type === "trail" ? `/trails/${place.id}` : place.type === "event" ? "/events" : `/discover/${place.id}`;

  return (
    <div
      role="complementary"
      aria-label="Next on your plan"
      className={`sticky ${LAYOUT.stickyTop} z-20 flex items-center gap-3 ${LAYOUT.safeAreaX} py-2 bg-aegean/95 text-white backdrop-blur-sm border-b border-aegean/80 shadow-sm`}
    >
      <span className="text-xs font-medium text-white/80 shrink-0">Next up</span>
      <AppLink
        href={href}
        className="flex-1 min-w-0 truncate font-semibold hover:underline text-sm"
      >
        {place.name}
      </AppLink>
      <NavigateButton place={place} label="Navigate" variant="light" className="shrink-0" />
    </div>
  );
}
