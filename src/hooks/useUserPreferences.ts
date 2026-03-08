"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getUserPreferences,
  setUserPreferences,
  toggleInterest as doToggleInterest,
  toggleFavoriteRegion as doToggleFavoriteRegion,
  type UserPreferences,
  type Interest,
} from "@/lib/user-preferences";

export function useUserPreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>({ interests: [], travelerType: null, favoriteRegions: [], notifyTrailConditions: true, notifyEvents: true });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hydrate from localStorage after mount (SSR-safe). Single run, no subscription.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- valid hydration pattern for client-only storage
    setPrefs(getUserPreferences());
    setHydrated(true);
  }, []);

  const update = useCallback((partial: Partial<UserPreferences>) => {
    const next = setUserPreferences(partial);
    setPrefs(next);
    return next;
  }, []);

  const toggleInterest = useCallback((interest: Interest) => {
    const next = doToggleInterest(interest);
    setPrefs(next);
    return next;
  }, []);

  const toggleFavoriteRegion = useCallback((region: string) => {
    const next = doToggleFavoriteRegion(region);
    setPrefs(next);
    return next;
  }, []);

  return { prefs, update, toggleInterest, toggleFavoriteRegion, hydrated };
}
