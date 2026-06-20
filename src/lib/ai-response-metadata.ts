import type { PlaceCard, ResponseAction, ResponseMetadata } from "@/lib/concierge/types";
import { resolveInternalPath } from "@/lib/resolve-internal-path";
import { sanitizeText } from "@/lib/sanitize";

const CARD_TYPES = new Set<PlaceCard["type"]>(["place", "trail", "event", "winery"]);
const ACTION_TYPES = new Set<ResponseAction["type"]>([
  "open_place",
  "save_to_plan",
  "show_on_map",
  "view_events",
  "book_now",
  "build_day_plan",
]);

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function stringField(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const text = sanitizeText(value, maxLength);
  return text || null;
}

function sanitizeCard(raw: unknown): PlaceCard | null {
  const card = asRecord(raw);
  if (!card) return null;

  const type = stringField(card.type, 32);
  if (!type || !CARD_TYPES.has(type as PlaceCard["type"])) return null;

  const id = stringField(card.id, 128);
  const title = stringField(card.title, 160);
  const reason = stringField(card.reason, 240);
  if (!id || !title || !reason) return null;

  return { type: type as PlaceCard["type"], id, title, reason };
}

function sanitizeAction(raw: unknown): ResponseAction | null {
  const action = asRecord(raw);
  if (!action) return null;

  const type = stringField(action.type, 64);
  if (!type || !ACTION_TYPES.has(type as ResponseAction["type"])) return null;

  const label = stringField(action.label, 120);
  if (!label) return null;

  const payload = asRecord(action.payload);
  if (!payload) return { type: type as ResponseAction["type"], label };

  const safePayload = { ...payload };
  if (typeof safePayload.path === "string") {
    const path = stringField(safePayload.path, 256);
    safePayload.path = path ? resolveInternalPath(path) : undefined;
  }

  return { type: type as ResponseAction["type"], label, payload: safePayload };
}

export function sanitizeResponseMetadata(metadata: unknown): ResponseMetadata {
  const raw = asRecord(metadata);
  if (!raw) return {};

  const cards = Array.isArray(raw.cards)
    ? raw.cards.map(sanitizeCard).filter((card): card is PlaceCard => Boolean(card)).slice(0, 6)
    : [];
  const actions = Array.isArray(raw.actions)
    ? raw.actions.map(sanitizeAction).filter((action): action is ResponseAction => Boolean(action)).slice(0, 6)
    : [];
  const followUps = Array.isArray(raw.followUps)
    ? raw.followUps
        .map((followUp) => stringField(followUp, 120))
        .filter((followUp): followUp is string => Boolean(followUp))
        .slice(0, 4)
    : [];

  const sanitized: ResponseMetadata = {};
  if (cards.length) sanitized.cards = cards;
  if (actions.length) sanitized.actions = actions;
  if (followUps.length) sanitized.followUps = followUps;
  return sanitized;
}
