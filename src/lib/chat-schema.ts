import { z } from "zod";
import type { Locale } from "@/i18n/routing";

const CHAT_LOCALES = ["en", "el", "de", "pl", "ro", "fr", "he"] as const satisfies readonly Locale[];

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(10000),
});

export const chatRequestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(24),
  context: z
    .object({
      locale: z.enum(CHAT_LOCALES).optional(),
      path: z.string().max(256).optional(),
      lastPlace: z.string().max(256).optional(),
      itinerary: z
        .array(
          z.object({
            day: z.number().int().min(1).max(14),
            placeIds: z.array(z.string().max(128)).max(50),
          })
        )
        .max(14)
        .optional(),
      currentLocation: z
        .object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) })
        .optional(),
      tripDates: z
        .object({ start: z.string().max(32), end: z.string().max(32) })
        .optional(),
      tripStage: z.enum(["pre_trip", "during_trip", "post_trip"]).optional(),
    })
    .optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
