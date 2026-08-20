/**
 * Client-side localStorage helpers for bookings.
 * Used by /bookings page and WineryBookingForm.
 */
import type { Booking } from "./bookings";

const STORAGE_KEY = "cyprus-bookings";

/**
 * Merge local and API bookings. Dedupe by id (**API wins** on collision so
 * partner-confirmed/cancelled status is not stuck as local `pending`).
 * Returns combined list sorted by createdAt descending.
 */
export function mergeBookings(local: Booking[], api: Booking[]): Booking[] {
  const byId = new Map<string, Booking>();
  for (const b of local) byId.set(b.id, b);
  for (const b of api) byId.set(b.id, b);
  return [...byId.values()].sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
}

export function loadLocalBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalBookings(bookings: Booking[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch {
    // localStorage full or disabled
  }
}

export function addBookingToLocal(booking: Booking): void {
  const stored = loadLocalBookings();
  stored.push(booking);
  saveLocalBookings(stored);
}
