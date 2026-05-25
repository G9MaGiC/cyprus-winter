import type { PlaceCard, ResponseAction, ResponseMetadata } from "@/lib/concierge/types";
import { sanitizeText } from "@/lib/sanitize";
import { isSafeInternalPath } from "@/lib/safe-internal-path";

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
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function cleanString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const cleaned = sanitizeText(value, maxLength);
  return cleaned || null;
}

function sanitizeActionPayload(value: unknown): Record<string, unknown> | undefined {
  const payload = asRecord(value);
  if (!payload) return undefined;

  const path = cleanString(payload.path, 256);
  if (!path || path.includes("\\") || !isSafeInternalPath(path)) return undefined;

  return { path };
}

function sanitizeCards(value: unknown): PlaceCard[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const cards = value
    .slice(0, 8)
    .map((raw): PlaceCard | null => {
      const card = asRecord(raw);
      if (!card) return null;

      const type = cleanString(card.type, 24);
      if (!type || !CARD_TYPES.has(type as PlaceCard["type"])) return null;

      const id = cleanString(card.id, 128);
      const title = cleanString(card.title, 120);
      const reason = cleanString(card.reason, 180);
      if (!id || !title || !reason) return null;

      return { type: type as PlaceCard["type"], id, title, reason };
    })
    .filter((card): card is PlaceCard => Boolean(card));

  return cards.length ? cards : undefined;
}

function sanitizeActions(value: unknown): ResponseAction[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const actions = value
    .slice(0, 8)
    .map((raw): ResponseAction | null => {
      const action = asRecord(raw);
      if (!action) return null;

      const type = cleanString(action.type, 40);
      if (!type || !ACTION_TYPES.has(type as ResponseAction["type"])) return null;

      const label = cleanString(action.label, 80);
      if (!label) return null;

      const payload = sanitizeActionPayload(action.payload);
      return payload
        ? { type: type as ResponseAction["type"], label, payload }
        : { type: type as ResponseAction["type"], label };
    })
    .filter((action): action is ResponseAction => Boolean(action));

  return actions.length ? actions : undefined;
}

function sanitizeFollowUps(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const followUps = value
    .slice(0, 6)
    .map((raw) => cleanString(raw, 120))
    .filter((chip): chip is string => Boolean(chip));

  return followUps.length ? followUps : undefined;
}

export function sanitizeResponseMetadata(value: unknown): ResponseMetadata {
  const record = asRecord(value);
  if (!record) return {};

  const metadata: ResponseMetadata = {};

  const cards = sanitizeCards(record.cards);
  if (cards) metadata.cards = cards;

  const actions = sanitizeActions(record.actions);
  if (actions) metadata.actions = actions;

  const followUps = sanitizeFollowUps(record.followUps);
  if (followUps) metadata.followUps = followUps;

  return metadata;
}
