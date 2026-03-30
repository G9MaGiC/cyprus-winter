import type { ResponseMetadata } from "./types";

export const ACTIONS_DELIMITER = "---ACTIONS---";

export type ParsedResponse = {
  prose: string;
  metadata?: ResponseMetadata;
};

export function parseResponse(raw: string): ParsedResponse {
  const delimiterIndex = raw.indexOf(ACTIONS_DELIMITER);

  if (delimiterIndex === -1) {
    return { prose: raw.trim() };
  }

  const prose = raw.slice(0, delimiterIndex).trim();
  const jsonStr = raw.slice(delimiterIndex + ACTIONS_DELIMITER.length).trim();

  try {
    const parsed = JSON.parse(jsonStr) as ResponseMetadata;
    return { prose, metadata: parsed };
  } catch {
    return { prose };
  }
}
