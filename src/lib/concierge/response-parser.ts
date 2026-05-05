import type { PlaceCard, ResponseAction, ResponseMetadata } from "./types";

const DELIMITER = "---ACTIONS---";

export type ParsedResponse = {
  prose: string;
  metadata?: ResponseMetadata;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isSafeInternalPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("\\") && path.length <= 256;
}

export function parseResponseMetadata(value: unknown): ResponseMetadata | undefined {
  if (!isRecord(value)) return undefined;

  const metadata: ResponseMetadata = {};

  if (Array.isArray(value.cards)) {
    const cards = value.cards.filter(
      (card): card is PlaceCard =>
        isRecord(card) &&
        typeof card.type === "string" &&
        typeof card.id === "string" &&
        typeof card.title === "string" &&
        typeof card.reason === "string"
    );
    if (cards.length > 0) metadata.cards = cards;
  }

  if (Array.isArray(value.actions)) {
    const actions = value.actions.flatMap((action): ResponseAction[] => {
      if (!isRecord(action) || typeof action.type !== "string" || typeof action.label !== "string") {
        return [];
      }
      if (action.payload === undefined) {
        return [{ type: action.type, label: action.label }];
      }
      if (!isRecord(action.payload)) {
        return [];
      }
      const path = action.payload.path;
      if (path !== undefined && (typeof path !== "string" || !isSafeInternalPath(path))) {
        return [];
      }
      return [{ type: action.type, label: action.label, payload: action.payload }];
    });
    if (actions.length > 0) metadata.actions = actions;
  }

  if (Array.isArray(value.followUps)) {
    const followUps = value.followUps.filter((followUp): followUp is string => typeof followUp === "string");
    if (followUps.length > 0) metadata.followUps = followUps;
  }

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
    const metadata = parseResponseMetadata(JSON.parse(jsonStr));
    return metadata ? { prose, metadata } : { prose };
  } catch {
    return { prose };
  }
}
