import { z } from "zod";

/** Returns today's date as YYYY-MM-DD in UTC. */
function todayUTC(): string {
  return new Date().toISOString().split("T")[0];
}

export const createBookingSchema = z.object({
  type: z.enum(["winery_tasting", "guide_tour"]),
  providerId: z.string().min(1),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .refine((d) => d >= todayUTC(), "Booking date must be today or in the future"),
  partySize: z.number().int().min(1).max(20),
  guestEmail: z.string().email().max(254),
  guestName: z.string().min(1).max(200),
  notes: z.string().max(500).optional(),
  trailId: z.string().optional(),
  /** Client-generated UUID for idempotency. Server rejects duplicate keys. */
  idempotencyKey: z.string().uuid().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
