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

const MAX_TRIP_DAYS = 14;

function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
}

/**
 * Trip length in days (start to end inclusive). Null if invalid range or dates missing.
 */
export function tripLengthFromDates(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  const a = parseDateOnly(start);
  const b = parseDateOnly(end);
  if (!a || !b || b.getTime() < a.getTime()) return null;
  const days = Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.min(MAX_TRIP_DAYS, Math.max(1, days));
}

/**
 * Days until trip start (0 = today, 1 = tomorrow, negative = past).
 * Returns null if no start date.
 */
export function daysUntilTrip(start: string | null): number | null {
  if (!start) return null;
  const d = parseDateOnly(start);
  if (!d) return null;
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
  const tripLength = tripLengthFromDates(dates.start, dates.end);

  return { dates, setTripDates, hydrated, daysUntil, withinSevenDays, tripLength };
}
