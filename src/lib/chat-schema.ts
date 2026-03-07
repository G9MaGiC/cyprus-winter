import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(10000),
});

export const chatRequestSchema = z.object({
  messages: z.array(messageSchema).min(1),
  context: z
    .object({
      path: z.string().optional(),
      lastPlace: z.string().optional(),
    })
    .optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
