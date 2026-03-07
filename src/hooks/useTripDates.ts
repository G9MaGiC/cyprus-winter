"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "cyprus-winter-trip-dates";

export type TripDates = {
  start: string | null;
  end: string | null;
};

function loadTripDates(): TripDates {
  if (typeof window === "undefined") return { start: null, end: null };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { start?: string; end?: string };
      return {
        start: typeof parsed.start === "string" ? parsed.start : null,
        end: typeof parsed.end === "string" ? parsed.end : null,
      };
    }
  } catch {
    // ignore
  }
  return { start: null, end: null };
}

function saveTripDates(dates: TripDates) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dates));
  } catch {
    // ignore
  }
}

/**
 * Days until trip start (0 = today, 1 = tomorrow, negative = past).
 * Returns null if no start date.
 */
export function daysUntilTrip(start: string | null): number | null {
  if (!start) return null;
  const d = new Date(start);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function useTripDates() {
  const [dates, setDates] = useState<TripDates>({ start: null, end: null });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hydrate from localStorage after mount (SSR-safe). Single run, no subscription.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- valid hydration pattern for client-only storage
    setDates(loadTripDates());
    setHydrated(true);
  }, []);

  const setTripDates = useCallback((start: string | null, end: string | null) => {
    const next = { start, end };
    setDates(next);
    saveTripDates(next);
  }, []);

  const daysUntil = daysUntilTrip(dates.start);
  const withinSevenDays = daysUntil !== null && daysUntil >= 0 && daysUntil <= 7;

  return { dates, setTripDates, hydrated, daysUntil, withinSevenDays };
}
