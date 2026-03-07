"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type StickyPlanBarContextValue = {
  stickyPlanVisible: boolean;
  setStickyPlanVisible: (visible: boolean) => void;
};

const StickyPlanBarContext = createContext<StickyPlanBarContextValue | null>(null);

export function StickyPlanBarProvider({ children }: { children: ReactNode }) {
  const [stickyPlanVisible, setStickyPlanVisible] = useState(false);
  return (
    <StickyPlanBarContext.Provider value={{ stickyPlanVisible, setStickyPlanVisible }}>
      {children}
    </StickyPlanBarContext.Provider>
  );
}

export function useStickyPlanBar() {
  const ctx = useContext(StickyPlanBarContext);
  if (!ctx) return { stickyPlanVisible: false, setStickyPlanVisible: () => {} };
  return ctx;
}
