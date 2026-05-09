"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";

/**
 * Scrolls to top of the page whenever the route (pathname) changes.
 * Ensures users always land at the top when opening a new page via Link or router.
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
