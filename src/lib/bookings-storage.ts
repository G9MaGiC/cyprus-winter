/**
 * Client-side localStorage helpers for bookings.
 * Used by /bookings page and WineryBookingForm.
 */
import type { Booking } from "./bookings";

const STORAGE_KEY = "cyprus-bookings";

/**
 * Merge local and API bookings. Dedupe by id (local wins).
 * Returns combined list sorted by createdAt descending.
 */
export function mergeBookings(local: Booking[], api: Booking[]): Booking[] {
  const seen = new Set(local.map((b) => b.id));
  const merged = [...local];
  for (const b of api) {
    if (!seen.has(b.id)) {
      merged.push(b);
      seen.add(b.id);
    }
  }
  return merged.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
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
