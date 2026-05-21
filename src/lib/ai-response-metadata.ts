import { sanitizeText } from "@/lib/sanitize";

const MAX_CARDS = 4;
const MAX_ACTIONS = 4;
const MAX_FOLLOW_UPS = 4;
const LOCALE_PREFIX_RE = /^\/(?:en|el|de|pl)(?=\/|$)/;

export type AIResponseMetadata = {
  cards?: { type: string; id: string; title: string; reason: string }[];
  actions?: { type: string; label: string; payload?: { path?: string } }[];
  followUps?: string[];
};

export type StoredChatMessage = {
  role: "user" | "assistant";
  content: string;
  metadata?: AIResponseMetadata;
};

function normalizeInternalPath(path: unknown): string | undefined {
  if (typeof path !== "string") return undefined;
  const sanitized = sanitizeText(path, 256);
  if (!sanitized.startsWith("/") || sanitized.startsWith("//") || sanitized.includes("\\")) {
    return undefined;
  }
  return sanitized.replace(LOCALE_PREFIX_RE, "") || "/";
}

export function sanitizeResponseMetadata(raw: unknown): AIResponseMetadata {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  const metadata: AIResponseMetadata = {};

  if (Array.isArray(obj.cards)) {
    const cards = obj.cards
      .slice(0, MAX_CARDS)
      .map((card) => {
        if (!card || typeof card !== "object") return null;
        const item = card as Record<string, unknown>;
        const type = typeof item.type === "string" ? sanitizeText(item.type, 32) : "";
        const id = typeof item.id === "string" ? sanitizeText(item.id, 128) : "";
        const title = typeof item.title === "string" ? sanitizeText(item.title, 120) : "";
        const reason = typeof item.reason === "string" ? sanitizeText(item.reason, 180) : "";
        if (!type || !id || !title || !reason) return null;
        return { type, id, title, reason };
      })
      .filter((card): card is NonNullable<typeof card> => Boolean(card));
    if (cards.length > 0) metadata.cards = cards;
  }

  if (Array.isArray(obj.actions)) {
    const actions = obj.actions
      .slice(0, MAX_ACTIONS)
      .map((action) => {
        if (!action || typeof action !== "object") return null;
        const item = action as Record<string, unknown>;
        const type = typeof item.type === "string" ? sanitizeText(item.type, 64) : "";
        const label = typeof item.label === "string" ? sanitizeText(item.label, 80) : "";
        if (!type || !label) return null;

        const path = normalizeInternalPath(
          item.payload && typeof item.payload === "object"
            ? (item.payload as Record<string, unknown>).path
            : undefined
        );
        return path ? { type, label, payload: { path } } : { type, label };
      })
      .filter((action): action is NonNullable<typeof action> => Boolean(action));
    if (actions.length > 0) metadata.actions = actions;
  }

  if (Array.isArray(obj.followUps)) {
    const followUps = obj.followUps
      .slice(0, MAX_FOLLOW_UPS)
      .map((followUp) => (typeof followUp === "string" ? sanitizeText(followUp, 100) : ""))
      .filter(Boolean);
    if (followUps.length > 0) metadata.followUps = followUps;
  }

  return metadata;
}

export function sanitizeStoredChatMessages(raw: unknown): StoredChatMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const messages = raw
    .map((message) => {
      if (!message || typeof message !== "object") return null;
      const item = message as Record<string, unknown>;
      const role = item.role;
      if (role !== "user" && role !== "assistant") return null;
      if (typeof item.content !== "string") return null;

      const metadata = sanitizeResponseMetadata(item.metadata);
      return Object.keys(metadata).length > 0
        ? { role, content: item.content, metadata }
        : { role, content: item.content };
    })
    .filter((message): message is StoredChatMessage => Boolean(message));

  return messages.length > 0 ? messages : null;
}
