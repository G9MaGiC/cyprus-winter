import { resolveInternalPath } from "@/lib/resolve-internal-path";
import { sanitizeText } from "@/lib/sanitize";

type ChatRole = "user" | "assistant";

export type SafeChatMetadata = {
  cards?: { type: string; id: string; title: string; reason: string }[];
  actions?: { type: string; label: string; payload?: Record<string, unknown> }[];
  followUps?: string[];
};

export type SafeStoredChatMessage = {
  role: ChatRole;
  content: string;
  isRetryable?: boolean;
  is503?: boolean;
  metadata?: SafeChatMetadata;
};

const CARD_TYPES = new Set(["trail", "winery", "event", "place"]);
const ACTION_TYPES = new Set([
  "open_place",
  "show_on_map",
  "view_events",
  "book_now",
  "build_day_plan",
  "save_to_plan",
]);
const LOCALE_PREFIX_RE = /^\/(?:en|el|de|pl|ro|fr|he)(?=\/|$)/;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function stripLocalePrefix(path: string): string {
  const stripped = path.replace(LOCALE_PREFIX_RE, "");
  return stripped === "" ? "/" : stripped;
}

function isSafeMetadataId(id: string): boolean {
  return Boolean(id) && !/[/?#\\]/.test(id) && !id.includes("..");
}

function sanitizeActionPayload(payload: unknown): Record<string, unknown> | undefined {
  const obj = asRecord(payload);
  if (!obj) return undefined;

  const out: Record<string, unknown> = {};
  if (typeof obj.path === "string") {
    const path = sanitizeText(obj.path, 256);
    out.path = resolveInternalPath(stripLocalePrefix(path));
  }
  if (typeof obj.id === "string") {
    const id = sanitizeText(obj.id, 128);
    if (isSafeMetadataId(id)) out.id = id;
  }
  if (typeof obj.day === "number" && Number.isInteger(obj.day) && obj.day >= 1 && obj.day <= 14) {
    out.day = obj.day;
  }

  return Object.keys(out).length > 0 ? out : undefined;
}

export function sanitizeResponseMetadata(metadata: unknown): SafeChatMetadata {
  const obj = asRecord(metadata);
  if (!obj) return {};

  const cards = Array.isArray(obj.cards)
    ? obj.cards
        .slice(0, 6)
        .map((raw) => {
          const card = asRecord(raw);
          if (!card) return null;
          const type = typeof card.type === "string" ? sanitizeText(card.type, 32) : "";
          const id = typeof card.id === "string" ? sanitizeText(card.id, 128) : "";
          const title = typeof card.title === "string" ? sanitizeText(card.title, 120) : "";
          const reason = typeof card.reason === "string" ? sanitizeText(card.reason, 180) : "";
          if (!CARD_TYPES.has(type) || !isSafeMetadataId(id) || !title || !reason) return null;
          return { type, id, title, reason };
        })
        .filter((card): card is { type: string; id: string; title: string; reason: string } => Boolean(card))
    : undefined;

  const actions = Array.isArray(obj.actions)
    ? obj.actions
        .slice(0, 6)
        .map((raw) => {
          const action = asRecord(raw);
          if (!action) return null;
          const type = typeof action.type === "string" ? sanitizeText(action.type, 48) : "";
          const label = typeof action.label === "string" ? sanitizeText(action.label, 80) : "";
          if (!ACTION_TYPES.has(type) || !label) return null;
          const payload = sanitizeActionPayload(action.payload);
          return payload ? { type, label, payload } : { type, label };
        })
        .filter((action): action is { type: string; label: string; payload?: Record<string, unknown> } => Boolean(action))
    : undefined;

  const followUps = Array.isArray(obj.followUps)
    ? obj.followUps
        .slice(0, 6)
        .filter((followUp): followUp is string => typeof followUp === "string")
        .map((followUp) => sanitizeText(followUp, 100))
        .filter(Boolean)
    : undefined;

  const safe: SafeChatMetadata = {};
  if (cards && cards.length > 0) safe.cards = cards;
  if (actions && actions.length > 0) safe.actions = actions;
  if (followUps && followUps.length > 0) safe.followUps = followUps;
  return safe;
}

export function sanitizeStoredChatMessages(messages: unknown): SafeStoredChatMessage[] {
  if (!Array.isArray(messages)) return [];

  return messages
    .slice(-20)
    .map((raw) => {
      const message = asRecord(raw);
      if (!message) return null;
      const role = message.role === "user" || message.role === "assistant" ? message.role : null;
      const content = typeof message.content === "string" ? sanitizeText(message.content, 10000) : "";
      if (!role || !content) return null;

      const safe: SafeStoredChatMessage = { role, content };
      if (message.isRetryable === true) safe.isRetryable = true;
      if (message.is503 === true) safe.is503 = true;
      if (role === "assistant") {
        const metadata = sanitizeResponseMetadata(message.metadata);
        if (Object.keys(metadata).length > 0) safe.metadata = metadata;
      }
      return safe;
    })
    .filter((message): message is SafeStoredChatMessage => Boolean(message));
}
