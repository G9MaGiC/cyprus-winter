import type { PlaceCard, ResponseAction, ResponseMetadata } from "@/lib/concierge/types";

type StoredChatMessage = {
  role: "user" | "assistant";
  content: string;
  isRetryable?: boolean;
  is503?: boolean;
  metadata?: ResponseMetadata;
};

const ACTION_TYPES = new Set([
  "open_place",
  "save_to_plan",
  "show_on_map",
  "view_events",
  "book_now",
  "build_day_plan",
]);
const CARD_TYPES = new Set(["place", "trail", "event", "winery"]);

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function cleanString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function cleanSlug(value: unknown): string | null {
  const slug = cleanString(value, 100);
  return slug && /^[a-z0-9-]+$/i.test(slug) ? slug : null;
}

function cleanInternalPath(value: unknown): string | null {
  const path = cleanString(value, 240);
  if (!path || !path.startsWith("/") || path.startsWith("//")) return null;
  if (/[\u0000-\u001f]/.test(path)) return null;
  return path.replace(/^\/(?:en|de|fr)(?=\/)/, "");
}

export function sanitizeResponseMetadata(input: unknown): ResponseMetadata | undefined {
  const raw = asRecord(input);
  if (!raw) return undefined;

  const metadata: ResponseMetadata = {};

  if (Array.isArray(raw.cards)) {
    const cards = raw.cards.flatMap((card) => {
      const item = asRecord(card);
      if (!item) return [];
      const type = cleanString(item.type, 30);
      const id = cleanSlug(item.id);
      const title = cleanString(item.title, 120);
      const reason = cleanString(item.reason, 180);
      return type && CARD_TYPES.has(type) && id && title && reason
        ? [{ type: type as PlaceCard["type"], id, title, reason }]
        : [];
    });
    if (cards.length > 0) metadata.cards = cards.slice(0, 6);
  }

  if (Array.isArray(raw.actions)) {
    const actions = raw.actions.flatMap((action) => {
      const item = asRecord(action);
      if (!item) return [];
      const type = cleanString(item.type, 40);
      const label = cleanString(item.label, 80);
      if (!type || !ACTION_TYPES.has(type) || !label) return [];

      const payload = asRecord(item.payload);
      const path = cleanInternalPath(payload?.path);
      return [
        path
          ? { type: type as ResponseAction["type"], label, payload: { path } }
          : { type: type as ResponseAction["type"], label },
      ];
    });
    if (actions.length > 0) metadata.actions = actions.slice(0, 4);
  }

  if (Array.isArray(raw.followUps)) {
    const followUps = raw.followUps.flatMap((followUp) => {
      const text = cleanString(followUp, 100);
      return text ? [text] : [];
    });
    if (followUps.length > 0) metadata.followUps = followUps.slice(0, 6);
  }

  return Object.keys(metadata).length > 0 ? metadata : undefined;
}

export function sanitizeStoredChatMessages(messages: unknown[]): StoredChatMessage[] {
  return messages.flatMap((message) => {
    const item = asRecord(message);
    if (!item) return [];
    const role = item.role === "user" || item.role === "assistant" ? item.role : null;
    const content = typeof item.content === "string" ? item.content : null;
    if (!role || content === null) return [];

    const sanitized: StoredChatMessage = {
      role,
      content,
    };
    if (item.isRetryable === true) sanitized.isRetryable = true;
    if (item.is503 === true) sanitized.is503 = true;
    const metadata = sanitizeResponseMetadata(item.metadata);
    if (metadata) sanitized.metadata = metadata;
    return [sanitized];
  });
}
