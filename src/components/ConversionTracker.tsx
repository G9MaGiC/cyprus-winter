"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";
import { getPlaceById } from "@/data";

export default function ConversionTracker() {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    const isDiscover = pathname === "/discover";
    const isDiscoverDetail = pathname.startsWith("/discover/") && pathname !== "/discover";
    const isWineryBook = pathname.startsWith("/book/winery/");

    track("page_view", { path: pathname });

    if (isDiscover) {
      track("discover_view");
    }
    if (isDiscoverDetail && pathname !== prevPath.current) {
      const id = pathname.replace("/discover/", "");
      const place = getPlaceById(id);
      if (place?.type === "winery") {
        track("winery_detail_view", { placeId: id });
      }
    }
    if (isWineryBook && pathname !== prevPath.current) {
      const id = pathname.replace("/book/winery/", "");
      track("booking_start", { wineryId: id });
    }

    prevPath.current = pathname;
  }, [pathname]);

  return null;
}
