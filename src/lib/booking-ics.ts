/**
 * Single-booking ICS export for /bookings — the page tells users to "set a
 * reminder", so hand them the calendar entry (AUD B2-10 / AUD-82). Mirrors
 * plan-ics.ts conventions: all-day events, RFC 5545 text escaping.
 */
import type { Booking } from "@/lib/bookings";

function escapeIcsText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function toIcsDate(isoDate: string): string {
  return isoDate.replaceAll("-", "");
}

function nextDay(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}

export function buildBookingIcs(
  booking: Booking,
  labels: { summary: string; description: string }
): string {
  const dtStamp = `${toIcsDate(new Date().toISOString().slice(0, 10))}T120000Z`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cyprus Winter//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:booking-${booking.id}@cyprus-winter.app`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;VALUE=DATE:${toIcsDate(booking.date)}`,
    `DTEND;VALUE=DATE:${nextDay(booking.date)}`,
    `SUMMARY:${escapeIcsText(labels.summary)}`,
    `DESCRIPTION:${escapeIcsText(labels.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadBookingIcs(booking: Booking, labels: { summary: string; description: string }): void {
  const blob = new Blob([buildBookingIcs(booking, labels)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cyprus-winter-${booking.providerId}-${booking.date}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
