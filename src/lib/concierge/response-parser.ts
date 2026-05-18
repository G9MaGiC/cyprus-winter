import type { ResponseMetadata } from "./types";
import { sanitizeResponseMetadata } from "@/lib/ai-response-metadata";

const DELIMITER = "---ACTIONS---";

export type ParsedResponse = {
  prose: string;
  metadata?: ResponseMetadata;
};

export function parseResponse(raw: string): ParsedResponse {
  const delimiterIndex = raw.indexOf(DELIMITER);

  if (delimiterIndex === -1) {
    return { prose: raw.trim() };
  }

  const prose = raw.slice(0, delimiterIndex).trim();
  const jsonStr = raw.slice(delimiterIndex + DELIMITER.length).trim();

  try {
    const parsed = sanitizeResponseMetadata(JSON.parse(jsonStr));
    return parsed ? { prose, metadata: parsed } : { prose };
  } catch {
    return { prose };
  }
}
