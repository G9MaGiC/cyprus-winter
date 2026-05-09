"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const AIAssistantWithBoundary = dynamic(
  () => import("@/components/AIAssistantWithBoundary").then((m) => m.default),
  { ssr: false, loading: () => null }
);
const OnboardingModal = dynamic(
  () => import("@/components/OnboardingModal").then((m) => m.default),
  { ssr: false, loading: () => null }
);
import CookieConsentBanner from "@/components/CookieConsentBanner";

export default function ClientComponents() {
  const [mounted, setMounted] = useState(false);
  const [showDeferred, setShowDeferred] = useState(false);

  useEffect(() => {
    // Intentionally using setState for client-only rendering
    // This prevents hydration mismatches by only rendering on client
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Defer non-critical chunks until after the main page has fully loaded.
    // This avoids influencing LCP/FCP on first paint.
    const enable = () => setShowDeferred(true);

    if (document.readyState === "complete") {
      enable();
      return;
    }

    window.addEventListener("load", enable, { once: true });
    return () => window.removeEventListener("load", enable);
  }, [mounted]);

  if (!mounted) return null;

  return (
    <>
      <CookieConsentBanner />
      {showDeferred && (
        <>
          <AIAssistantWithBoundary />
          <OnboardingModal />
        </>
      )}
    </>
  );
}
