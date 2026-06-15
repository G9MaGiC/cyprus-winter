import { resolveInternalPath } from "@/lib/resolve-internal-path";
import { sanitizeText } from "@/lib/sanitize";

export type AIPlaceCard = {
  type: string;
  id: string;
  title: string;
  reason: string;
};

export type AIAction = {
  type: string;
  label: string;
  payload?: Record<string, unknown>;
};

export type AIResponseMetadata = {
  cards?: AIPlaceCard[];
  actions?: AIAction[];
  followUps?: string[];
};

export type StoredChatMessage = {
  role: "user" | "assistant";
  content: string;
  metadata?: AIResponseMetadata;
};

const LOCALE_PREFIX_RE = /^\/(en|el|de|pl|ro|fr|he)(?=\/|$)/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stripLocalePrefix(path: string): string {
  const stripped = path.replace(LOCALE_PREFIX_RE, "");
  return stripped === "" ? "/" : stripped;
}

function safeString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const safe = sanitizeText(value, maxLength).trim();
  return safe.length > 0 ? safe : null;
}

function sanitizeCards(value: unknown): AIPlaceCard[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const cards = value
    .slice(0, 6)
    .map((raw) => {
      if (!isRecord(raw)) return null;
      const type = safeString(raw.type, 32);
      const id = safeString(raw.id, 128);
      const title = safeString(raw.title, 120);
      const reason = safeString(raw.reason, 240);
      if (!type || !id || !title || !reason) return null;
      return { type, id, title, reason };
    })
    .filter((card): card is AIPlaceCard => Boolean(card));
  return cards.length > 0 ? cards : undefined;
}

function sanitizeActions(value: unknown): AIAction[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const actions = value
    .slice(0, 6)
    .map((raw) => {
      if (!isRecord(raw)) return null;
      const type = safeString(raw.type, 48);
      const label = safeString(raw.label, 80);
      if (!type || !label) return null;

      let payload: Record<string, unknown> | undefined;
      if (isRecord(raw.payload) && typeof raw.payload.path === "string") {
        const path = safeString(raw.payload.path, 256);
        if (path) payload = { path: resolveInternalPath(stripLocalePrefix(path)) };
      }

      return payload ? { type, label, payload } : { type, label };
    })
    .filter((action): action is AIAction => Boolean(action));
  return actions.length > 0 ? actions : undefined;
}

function sanitizeFollowUps(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const followUps = value
    .slice(0, 6)
    .map((raw) => safeString(raw, 100))
    .filter((chip): chip is string => Boolean(chip));
  return followUps.length > 0 ? followUps : undefined;
}

export function sanitizeResponseMetadata(metadata: unknown): AIResponseMetadata {
  if (!isRecord(metadata)) return {};

  const safe: AIResponseMetadata = {};
  const cards = sanitizeCards(metadata.cards);
  const actions = sanitizeActions(metadata.actions);
  const followUps = sanitizeFollowUps(metadata.followUps);

  if (cards) safe.cards = cards;
  if (actions) safe.actions = actions;
  if (followUps) safe.followUps = followUps;

  return safe;
}

export function sanitizeStoredChatMessages(messages: unknown, maxMessages = 20): StoredChatMessage[] {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter(isRecord)
    .map((raw) => {
      const role = raw.role;
      const content = safeString(raw.content, 10000);
      if ((role !== "user" && role !== "assistant") || !content) return null;
      const metadata = sanitizeResponseMetadata(raw.metadata);
      return Object.keys(metadata).length > 0
        ? { role, content, metadata }
        : { role, content };
    })
    .filter((message): message is StoredChatMessage => Boolean(message))
    .slice(-maxMessages);
}
