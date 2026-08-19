"use client";

import { usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { track, trackProduct } from "@/lib/analytics";
import { getPlaceById } from "@/data";

export default function ConversionTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPath = useRef<string | null>(null);
  const prevDiscoverFilter = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    const path = pathname.split("?")[0];
    const isDiscover = path === "/discover" || path.endsWith("/discover");
    const filter = searchParams?.get("filter")?.trim() || null;
    const isDiscoverDetail = path.includes("/discover/");
    const isWineryBook = path.includes("/book/winery/");
    const isGuideBook = path.includes("/book/guide/");

    track("page_view", { path: pathname });

    if (isDiscover) {
      track("discover_view", filter ? { filter } : undefined);
      if (filter && filter !== prevDiscoverFilter.current) {
        track("discover_filter", { filter });
        prevDiscoverFilter.current = filter;
      }
      if (!filter) prevDiscoverFilter.current = null;
    }
    if (isDiscoverDetail && pathname !== prevPath.current) {
      const segments = path.split("/").filter(Boolean);
      const id = segments[segments.length - 1] ?? "";
      const isValidId = /^[a-z0-9-]+$/i.test(id) && id.length <= 80;
      const place = isValidId ? getPlaceById(id) : undefined;
      if (place?.type === "winery") {
        track("winery_detail_view", { placeId: id });
      }
    }
    if (isWineryBook && pathname !== prevPath.current) {
      const segments = path.split("/").filter(Boolean);
      const id = segments[segments.length - 1] ?? "";
      if (/^[a-z0-9-]+$/i.test(id) && id.length <= 80) {
        trackProduct("booking_start", { wineryId: id });
      }
    }
    if (isGuideBook && pathname !== prevPath.current) {
      const segments = path.split("/").filter(Boolean);
      const id = segments[segments.length - 1] ?? "";
      if (id && /^[a-z0-9-]+$/i.test(id) && id.length <= 80) {
        trackProduct("booking_start", { guideId: id });
      }
    }

    prevPath.current = pathname;
  }, [pathname, searchParams]);

  return null;
}
