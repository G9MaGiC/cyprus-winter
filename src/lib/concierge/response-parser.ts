import { z } from "zod";
import type { ResponseMetadata } from "./types";

const DELIMITER = "---ACTIONS---";

const placeCardSchema = z.object({
  type: z.enum(["place", "trail", "event", "winery"]),
  id: z.string().min(1).max(128),
  title: z.string().min(1).max(160),
  reason: z.string().min(1).max(240),
});

const actionSchema = z.object({
  type: z.enum(["open_place", "save_to_plan", "show_on_map", "view_events", "book_now", "build_day_plan"]),
  label: z.string().min(1).max(80),
  payload: z.record(z.string(), z.unknown()).optional(),
});

const followUpSchema = z.string().min(1).max(120);

export type ParsedResponse = {
  prose: string;
  metadata?: ResponseMetadata;
};

function sanitizeArray<T>(value: unknown, schema: z.ZodType<T>, limit: number): T[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const valid = value
    .slice(0, limit)
    .map((item) => schema.safeParse(item))
    .filter((result): result is z.ZodSafeParseSuccess<T> => result.success)
    .map((result) => result.data);

  return valid.length > 0 ? valid : undefined;
}

export function sanitizeResponseMetadata(value: unknown): ResponseMetadata | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;

  const obj = value as Record<string, unknown>;
  const metadata: ResponseMetadata = {};

  const cards = sanitizeArray(obj.cards, placeCardSchema, 6);
  if (cards) metadata.cards = cards;

  const actions = sanitizeArray(obj.actions, actionSchema, 6);
  if (actions) metadata.actions = actions;

  const followUps = sanitizeArray(obj.followUps, followUpSchema, 6);
  if (followUps) metadata.followUps = followUps;

  return Object.keys(metadata).length > 0 ? metadata : undefined;
}

export function parseResponse(raw: string): ParsedResponse {
  const delimiterIndex = raw.indexOf(DELIMITER);

  if (delimiterIndex === -1) {
    return { prose: raw.trim() };
  }

  const prose = raw.slice(0, delimiterIndex).trim();
  const jsonStr = raw.slice(delimiterIndex + DELIMITER.length).trim();

  try {
    const metadata = sanitizeResponseMetadata(JSON.parse(jsonStr));
    return metadata ? { prose, metadata } : { prose };
  } catch {
    return { prose };
  }
}
