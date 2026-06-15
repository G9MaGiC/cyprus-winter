"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { StickyPlanBarProvider } from "@/contexts/StickyPlanBarContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import OfflineQueueProcessor from "@/components/OfflineQueueProcessor";

type ProvidersProps = {
  children: React.ReactNode;
  /** Omit OnboardingProvider when nested under root (e.g. locale layout) to avoid duplication */
  includeOnboarding?: boolean;
  /** Mount the offline mutation queue processor once at the root provider. */
  includeOfflineQueue?: boolean;
};

export default function Providers({
  children,
  includeOnboarding = true,
  includeOfflineQueue = true,
}: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StickyPlanBarProvider>
          {includeOnboarding ? (
            <OnboardingProvider>
              {includeOfflineQueue && <OfflineQueueProcessor />}
              {children}
            </OnboardingProvider>
          ) : (
            <>
              {includeOfflineQueue && <OfflineQueueProcessor />}
              {children}
            </>
          )}
        </StickyPlanBarProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
