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
  /** Omit the offline queue worker when nested under the root provider */
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
              {includeOfflineQueue ? <OfflineQueueProcessor /> : null}
              {children}
            </OnboardingProvider>
          ) : (
            <>
              {includeOfflineQueue ? <OfflineQueueProcessor /> : null}
              {children}
            </>
          )}
        </StickyPlanBarProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
