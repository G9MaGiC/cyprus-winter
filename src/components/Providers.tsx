"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { StickyPlanBarProvider } from "@/contexts/StickyPlanBarContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <StickyPlanBarProvider>{children}</StickyPlanBarProvider>
    </AuthProvider>
  );
}
