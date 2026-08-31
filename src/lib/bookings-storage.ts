/**
 * Client-side localStorage helpers for bookings.
 * Used by /bookings page and WineryBookingForm.
 */
import type { Booking } from "./bookings";

const STORAGE_KEY = "cyprus-bookings";

/**
 * Merge local and API bookings. Dedupe by id, field-wise on collision:
 * API values win (so partner-confirmed/cancelled status is never stuck as
 * local `pending` — BUG-172) but local-only fields survive, because the API's
 * public view strips guestEmail/guestName/notes and a whole-record overwrite
 * would erase them — permanently disabling the pending-status auto-check,
 * which keys on a stored guestEmail (BUG-361 / AUD B2-02).
 */
export function mergeBookings(local: Booking[], api: Booking[]): Booking[] {
  const byId = new Map<string, Booking>();
  for (const b of local) byId.set(b.id, b);
  for (const b of api) {
    const existing = byId.get(b.id);
    byId.set(b.id, existing ? mergePreferringApi(existing, b) : b);
  }
  return [...byId.values()].sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
}

function mergePreferringApi(local: Booking, api: Booking): Booking {
  const merged: Record<string, unknown> = { ...local };
  for (const [key, value] of Object.entries(api)) {
    if (value !== undefined && value !== null && value !== "") merged[key] = value;
  }
  return merged as unknown as Booking;
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
