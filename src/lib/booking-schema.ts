import { z } from "zod";

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function getCyprusDateInputValue(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Nicosia",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function isValidCalendarDate(value: string): boolean {
  const match = ISO_DATE_RE.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function isBookableDate(value: string): boolean {
  return isValidCalendarDate(value) && value >= getCyprusDateInputValue();
}

export const createBookingSchema = z.object({
  type: z.enum(["winery_tasting", "guide_tour"]),
  providerId: z.string().min(1),
  date: z
    .string()
    .regex(ISO_DATE_RE, "Date must be YYYY-MM-DD")
    .refine(isBookableDate, "Date must be today or later"),
  idempotencyKey: z
    .string()
    .min(16)
    .max(128)
    .regex(/^[A-Za-z0-9._:-]+$/, "Invalid idempotency key"),
  partySize: z.number().int().min(1).max(20),
  guestEmail: z.string().email().max(254),
  guestName: z.string().min(1).max(200),
  notes: z.string().max(500).optional(),
  trailId: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
