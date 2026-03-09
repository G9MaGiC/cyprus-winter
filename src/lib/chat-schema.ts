import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(10000),
});

export const chatRequestSchema = z.object({
  messages: z.array(messageSchema).min(1),
  context: z
    .object({
      path: z.string().max(256).optional(),
      lastPlace: z.string().max(256).optional(),
      itinerary: z
        .array(z.object({ day: z.number().int().min(1), placeIds: z.array(z.string().max(128)) }))
        .max(14)
        .optional(),
    })
    .optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
