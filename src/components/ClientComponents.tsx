"use client";

import { useState, useEffect } from "react";
import AIAssistantWithBoundary from "@/components/AIAssistantWithBoundary";
import AIFab from "@/components/ai/AIFab";
import OnboardingModal from "@/components/OnboardingModal";
import CookieConsentBanner from "@/components/CookieConsentBanner";

export default function ClientComponents() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Intentionally using setState for client-only rendering
    // This prevents hydration mismatches by only rendering on client
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <AIAssistantWithBoundary />
      <AIFab />
      <OnboardingModal />
      <CookieConsentBanner />
    </>
  );
}
