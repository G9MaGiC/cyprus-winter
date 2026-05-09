"use client";

import { useEffect, useState } from "react";
import { BLOCKING_OVERLAY_DIRTY_EVENT } from "@/lib/blocking-overlay-events";

function isBlockingActive(): boolean {
  if (typeof document === "undefined") return false;
  return !!document.querySelector(
    '[data-overlay-priority="blocking"][data-overlay-active="true"]'
  );
}

/** True while a blocking overlay (cookie, onboarding, etc.) should win over AI and other chrome. */
export function useBlockingOverlaysActive(): boolean {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const sync = () => setBlocked(isBlockingActive());
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-overlay-active", "data-overlay-priority"],
      childList: true,
    });
    window.addEventListener(BLOCKING_OVERLAY_DIRTY_EVENT, sync);
    return () => {
      observer.disconnect();
      window.removeEventListener(BLOCKING_OVERLAY_DIRTY_EVENT, sync);
    };
  }, []);

  return blocked;
}
