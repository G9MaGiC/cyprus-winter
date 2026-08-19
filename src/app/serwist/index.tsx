"use client";

import { useEffect, type ReactNode } from "react";

interface SerwistProviderProps {
  swUrl: string;
  children: ReactNode;
}

/**
 * Register the app service worker once at the root. It provides the offline
 * shell and also owns push notification handling.
 */
export function SerwistProvider({ swUrl, children }: SerwistProviderProps) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register(swUrl, { updateViaCache: "none" }).catch(() => {
      // Offline support is progressive enhancement; never block the app.
    });
  }, [swUrl]);

  return <>{children}</>;
}
