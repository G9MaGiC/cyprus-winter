import { z } from "zod";

export const createBookingSchema = z.object({
  type: z.literal("winery_tasting"),
  providerId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  partySize: z.number().int().min(1).max(20),
  guestEmail: z.string().email().max(254),
  guestName: z.string().min(1).max(200),
  notes: z.string().max(500).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
