"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  startTransition,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  ONBOARDING_TIP_PLAN_EMPTY,
  ONBOARDING_TIP_DISCOVER_FILTER,
  ONBOARDING_TIP_FIRST_ADD,
} from "@/lib/local-storage-keys";

type OnboardingContextValue = {
  hasSeenDiscover: boolean;
  hasAddedToPlan: boolean;
  planItemCount: number;
  setPlanItemCount: (n: number) => void;
  markAddedToPlan: () => void;
  showTipPlanEmpty: boolean;
  showTipDiscoverFilter: boolean;
  showTipFirstAdd: boolean;
  dismissTipPlanEmpty: () => void;
  dismissTipDiscoverFilter: () => void;
  dismissTipFirstAdd: () => void;
};

const defaultValue: OnboardingContextValue = {
  hasSeenDiscover: false,
  hasAddedToPlan: false,
  planItemCount: 0,
  setPlanItemCount: () => {},
  markAddedToPlan: () => {},
  showTipPlanEmpty: false,
  showTipDiscoverFilter: false,
  showTipFirstAdd: false,
  dismissTipPlanEmpty: () => {},
  dismissTipDiscoverFilter: () => {},
  dismissTipFirstAdd: () => {},
};

const OnboardingContext = createContext<OnboardingContextValue>(defaultValue);

export function useOnboardingContext() {
  const ctx = useContext(OnboardingContext);
  return ctx ?? defaultValue;
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [hasSeenDiscover, setHasSeenDiscover] = useState(false);
  const [planItemCount, setPlanItemCountState] = useState(0);
  const [hasAddedToPlan, setHasAddedToPlan] = useState(false);
  const [showTipPlanEmpty, setShowTipPlanEmpty] = useState(false);
  const [showTipDiscoverFilter, setShowTipDiscoverFilter] = useState(false);
  const [showTipFirstAdd, setShowTipFirstAdd] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    startTransition(() => {
      if (pathname?.includes("/discover")) setHasSeenDiscover(true);
    });
  }, [pathname, mounted]);

  const setPlanItemCount = useCallback((n: number) => {
    setPlanItemCountState(n);
    if (n > 0) setHasAddedToPlan(true);
  }, []);

  const markAddedToPlan = useCallback(() => setHasAddedToPlan(true), []);

  const dismissTipPlanEmpty = useCallback(() => {
    try { if (typeof window !== "undefined") localStorage.setItem(ONBOARDING_TIP_PLAN_EMPTY, "true"); } catch {}
    setShowTipPlanEmpty(false);
  }, []);

  const dismissTipDiscoverFilter = useCallback(() => {
    try { if (typeof window !== "undefined") localStorage.setItem(ONBOARDING_TIP_DISCOVER_FILTER, "true"); } catch {}
    setShowTipDiscoverFilter(false);
  }, []);

  const dismissTipFirstAdd = useCallback(() => {
    try { if (typeof window !== "undefined") localStorage.setItem(ONBOARDING_TIP_FIRST_ADD, "true"); } catch {}
    setShowTipFirstAdd(false);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    let dismissedPlanEmpty = false;
    let dismissedDiscoverFilter = false;
    let dismissedFirstAdd = false;
    try {
      dismissedPlanEmpty = localStorage.getItem(ONBOARDING_TIP_PLAN_EMPTY) === "true";
      dismissedDiscoverFilter = localStorage.getItem(ONBOARDING_TIP_DISCOVER_FILTER) === "true";
      dismissedFirstAdd = localStorage.getItem(ONBOARDING_TIP_FIRST_ADD) === "true";
    } catch {}
    startTransition(() => {
      setShowTipPlanEmpty(!dismissedPlanEmpty);
      setShowTipDiscoverFilter(!dismissedDiscoverFilter);
      setShowTipFirstAdd(!dismissedFirstAdd);
    });
  }, [mounted]);

  const value: OnboardingContextValue = {
    hasSeenDiscover,
    hasAddedToPlan,
    planItemCount,
    setPlanItemCount,
    markAddedToPlan,
    showTipPlanEmpty,
    showTipDiscoverFilter,
    showTipFirstAdd,
    dismissTipPlanEmpty,
    dismissTipDiscoverFilter,
    dismissTipFirstAdd,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}
