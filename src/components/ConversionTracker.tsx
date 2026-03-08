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

    const path = pathname.split("?")[0];
    const isDiscover = path === "/discover" || path.endsWith("/discover");
    const isDiscoverDetail = path.includes("/discover/");
    const isWineryBook = path.includes("/book/winery/");
    const isGuideBook = path.includes("/book/guide/");

    track("page_view", { path: pathname });

    if (isDiscover) {
      track("discover_view");
    }
    if (isDiscoverDetail && pathname !== prevPath.current) {
      const id = path.split("/").filter(Boolean).pop() ?? "";
      const place = getPlaceById(id);
      if (place?.type === "winery") {
        track("winery_detail_view", { placeId: id });
      }
    }
    if (isWineryBook && pathname !== prevPath.current) {
      const id = path.split("/").filter(Boolean).pop() ?? "";
      track("booking_start", { wineryId: id });
    }
    if (isGuideBook && pathname !== prevPath.current) {
      const id = path.split("/").filter(Boolean).pop() ?? "";
      if (id) track("booking_start", { guideId: id });
    }

    prevPath.current = pathname;
  }, [pathname]);

  return null;
}
