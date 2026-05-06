import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(10000),
});

const chatMetadataCardSchema = z.object({
  type: z.string().min(1).max(32),
  id: z.string().min(1).max(128),
  title: z.string().min(1).max(160),
  reason: z.string().min(1).max(240),
});

const chatMetadataActionSchema = z.object({
  type: z.string().min(1).max(32),
  label: z.string().min(1).max(80),
  payload: z.record(z.string(), z.unknown()).optional(),
});

const chatMetadataSchema = z.object({
  cards: z.array(chatMetadataCardSchema).max(6).optional(),
  actions: z.array(chatMetadataActionSchema).max(6).optional(),
  followUps: z.array(z.string().min(1).max(100)).max(4).optional(),
});

export const chatRequestSchema = z.object({
  messages: z.array(messageSchema).min(1),
  context: z
    .object({
      locale: z.enum(["en", "el", "de", "pl"]).optional(),
      path: z.string().max(256).optional(),
      lastPlace: z.string().max(256).optional(),
      itinerary: z
        .array(z.object({ day: z.number().int().min(1), placeIds: z.array(z.string().max(128)) }))
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
export type ChatMetadata = z.infer<typeof chatMetadataSchema>;

export function sanitizeChatMetadata(value: unknown): ChatMetadata | undefined {
  const parsed = chatMetadataSchema.safeParse(value);
  if (!parsed.success) return undefined;
  const { cards, actions, followUps } = parsed.data;
  if (!cards?.length && !actions?.length && !followUps?.length) return undefined;
  return parsed.data;
}
