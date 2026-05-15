export type AIResponseCard = {
  type: "trail" | "winery" | "event" | "place";
  id: string;
  title: string;
  reason: string;
};

export type AIResponseAction = {
  type:
    | "open_place"
    | "show_on_map"
    | "view_events"
    | "book_now"
    | "build_day_plan"
    | "save_to_plan";
  label: string;
  payload?: { path?: string };
};

export type AIResponseMetadata = {
  cards?: AIResponseCard[];
  actions?: AIResponseAction[];
  followUps?: string[];
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

function sanitizeString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function isSafeSlug(value: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,127}$/.test(value);
}

function isSafeInternalPath(value: string): boolean {
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//")) return false;
  if (value.includes("\\")) return false;
  if (value.length > 256) return false;
  return true;
}

function sanitizeCard(value: unknown): AIResponseCard | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const obj = value as Record<string, unknown>;
  const type = sanitizeString(obj.type, 32);
  const id = sanitizeString(obj.id, 128);
  const title = sanitizeString(obj.title, 120);
  const reason = sanitizeString(obj.reason, 180);

  if (!type || !CARD_TYPES.has(type) || !id || !isSafeSlug(id) || !title || !reason) {
    return null;
  }

  return {
    type: type as AIResponseCard["type"],
    id,
    title,
    reason,
  };
}

function sanitizeAction(value: unknown): AIResponseAction | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const obj = value as Record<string, unknown>;
  const type = sanitizeString(obj.type, 32);
  const label = sanitizeString(obj.label, 80);

  if (!type || !ACTION_TYPES.has(type) || !label) return null;

  const action: AIResponseAction = {
    type: type as AIResponseAction["type"],
    label,
  };

  const payload = obj.payload;
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const path = sanitizeString((payload as Record<string, unknown>).path, 256);
    if (path && isSafeInternalPath(path)) action.payload = { path };
  }

  return action;
}

export function sanitizeResponseMetadata(input: unknown): AIResponseMetadata | undefined {
  if (!input || typeof input !== "object" || Array.isArray(input)) return undefined;
  const obj = input as Record<string, unknown>;
  const metadata: AIResponseMetadata = {};

  if (Array.isArray(obj.cards)) {
    const cards = obj.cards.slice(0, 6).map(sanitizeCard).filter((card): card is AIResponseCard => !!card);
    if (cards.length > 0) metadata.cards = cards;
  }

  if (Array.isArray(obj.actions)) {
    const actions = obj.actions
      .slice(0, 5)
      .map(sanitizeAction)
      .filter((action): action is AIResponseAction => !!action);
    if (actions.length > 0) metadata.actions = actions;
  }

  if (Array.isArray(obj.followUps)) {
    const followUps = obj.followUps
      .slice(0, 6)
      .map((chip) => sanitizeString(chip, 80))
      .filter((chip): chip is string => !!chip);
    if (followUps.length > 0) metadata.followUps = followUps;
  }

  return Object.keys(metadata).length > 0 ? metadata : undefined;
}
