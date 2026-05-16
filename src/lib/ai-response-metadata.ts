const CARD_TYPES = new Set(["trail", "winery", "event", "place"]);
const ACTION_TYPES = new Set([
  "open_place",
  "show_on_map",
  "view_events",
  "book_now",
  "build_day_plan",
  "save_to_plan",
]);

export type AIResponseCard = {
  type: string;
  id: string;
  title: string;
  reason: string;
};

export type AIResponseAction = {
  type: string;
  label: string;
  payload?: Record<string, unknown>;
};

export type AIResponseMetadata = {
  cards?: AIResponseCard[];
  actions?: AIResponseAction[];
  followUps?: string[];
};

export type StoredChatMessage = {
  role: "user" | "assistant";
  content: string;
  isRetryable?: boolean;
  is503?: boolean;
  metadata?: AIResponseMetadata;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function isSafeInternalPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("\\");
}

function normalizeInternalPath(path: string): string {
  return path.replace(/^\/(en|el|de|pl)(?=\/|$)/, "") || "/";
}

export function sanitizeResponseMetadata(input: unknown): AIResponseMetadata | null {
  if (!isRecord(input)) return null;

  const out: AIResponseMetadata = {};

  if (Array.isArray(input.cards)) {
    const cards = input.cards.flatMap((card): AIResponseCard[] => {
      if (!isRecord(card)) return [];
      const type = cleanText(card.type, 32);
      const id = cleanText(card.id, 128);
      const title = cleanText(card.title, 160);
      const reason = cleanText(card.reason, 240);
      if (!type || !CARD_TYPES.has(type) || !id || !title || !reason) return [];
      return [{ type, id, title, reason }];
    });
    if (cards.length > 0) out.cards = cards.slice(0, 6);
  }

  if (Array.isArray(input.actions)) {
    const actions = input.actions.flatMap((action): AIResponseAction[] => {
      if (!isRecord(action)) return [];
      const type = cleanText(action.type, 64);
      const label = cleanText(action.label, 120);
      if (!type || !ACTION_TYPES.has(type) || !label) return [];

      const cleanAction: AIResponseAction = { type, label };
      if (isRecord(action.payload)) {
        const payload: Record<string, unknown> = {};
        const path = cleanText(action.payload.path, 256);
        if (path && isSafeInternalPath(path)) payload.path = normalizeInternalPath(path);
        if (Object.keys(payload).length > 0) cleanAction.payload = payload;
      }
      return [cleanAction];
    });
    if (actions.length > 0) out.actions = actions.slice(0, 6);
  }

  if (Array.isArray(input.followUps)) {
    const followUps = input.followUps.flatMap((chip): string[] => {
      const text = cleanText(chip, 120);
      return text ? [text] : [];
    });
    if (followUps.length > 0) out.followUps = followUps.slice(0, 4);
  }

  return Object.keys(out).length > 0 ? out : null;
}

export function sanitizeStoredChatMessages(input: unknown): StoredChatMessage[] | null {
  if (!Array.isArray(input) || input.length === 0) return null;

  const valid = input.flatMap((message): StoredChatMessage[] => {
    if (!isRecord(message)) return [];
    const role = message.role;
    if (role !== "user" && role !== "assistant") return [];
    if (typeof message.content !== "string") return [];

    const clean: StoredChatMessage = { role, content: message.content };
    if (message.isRetryable === true) clean.isRetryable = true;
    if (message.is503 === true) clean.is503 = true;

    const metadata = sanitizeResponseMetadata(message.metadata);
    if (metadata) clean.metadata = metadata;

    return [clean];
  });

  return valid.length > 0 ? valid : null;
}
