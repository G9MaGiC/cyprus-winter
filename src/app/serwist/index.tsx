"use client";

import { useEffect, type ReactNode } from "react";
import dynamic from "next/dynamic";

const InstallPromptBanner = dynamic(
  () => import("@/components/InstallPromptBanner").then((m) => m.default),
  { ssr: false, loading: () => null }
);

interface SerwistProviderProps {
  swUrl: string;
  children: ReactNode;
}

/**
 * Register the app service worker once at the root. It provides the offline
 * shell and also owns push notification handling.
 *
 * In development we intentionally unregister any existing worker — SW + Next
 * HMR fight each other and can force full page reloads every few seconds.
 */
export function SerwistProvider({ swUrl, children }: SerwistProviderProps) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV === "development") {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) {
          void reg.unregister();
        }
      });
      return;
    }

    navigator.serviceWorker.register(swUrl, { updateViaCache: "none" }).catch(() => {
      // Offline support is progressive enhancement; never block the app.
    });
  }, [swUrl]);

  return (
    <>
      {children}
      <InstallPromptBanner />
    </>
  );
}
