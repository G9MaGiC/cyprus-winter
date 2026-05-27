import { z } from "zod";

export const guideBookingSchema = z.object({
  date: z
    .string()
    .min(1)
    .refine((d) => {
      const parsed = new Date(d);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return !isNaN(parsed.getTime()) && parsed >= today;
    }),
  partySize: z.coerce.number().int().min(1).max(20),
  guestName: z.string().trim().min(1).max(200),
  guestEmail: z.string().trim().email().max(320),
  notes: z.string().max(500).optional().default(""),
  trailId: z.string().optional().default(""),
});

export type GuideBookingInput = z.infer<typeof guideBookingSchema>;

export const wineryBookingSchema = z.object({
  date: z
    .string()
    .min(1)
    .refine((d) => {
      const parsed = new Date(d);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return !isNaN(parsed.getTime()) && parsed >= today;
    }),
  partySize: z.coerce.number().int().min(1).max(20),
  guestName: z.string().trim().min(1).max(200),
  guestEmail: z.string().trim().email().max(320),
  notes: z.string().max(500).optional().default(""),
});

export type WineryBookingInput = z.infer<typeof wineryBookingSchema>;

export type BookingValidationLabels = {
  date: string;
  guestName: string;
  guestEmail: string;
  partySize?: string;
};

export function formatZodErrors(result: { success: boolean; error?: z.ZodError }): Record<string, string> {
  if (result.success || !result.error) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path.join(".");
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
}

/** Map Zod field keys to translated validation copy (avoids English defaults in UI). */
export function localizeBookingFieldErrors(
  errors: Record<string, string>,
  labels: BookingValidationLabels
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [field, fallback] of Object.entries(errors)) {
    if (field === "date") out.date = labels.date;
    else if (field === "guestName") out.guestName = labels.guestName;
    else if (field === "guestEmail") out.guestEmail = labels.guestEmail;
    else if (field === "partySize" && labels.partySize) out.partySize = labels.partySize;
    else out[field] = fallback;
  }
  return out;
}
