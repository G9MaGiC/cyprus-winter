import { winterEvents } from "@/data/events";
import type { WinterEvent } from "@/data/events";

export type SearchEventsInput = {
  month?: string;
  region?: string;
  type?: string;
  limit?: number;
};

export function searchEvents(input: SearchEventsInput): WinterEvent[] {
  let candidates = [...winterEvents];

  if (input.month) {
    candidates = candidates.filter((e) => e.month === input.month);
  }
  if (input.region) {
    const r = input.region.toLowerCase();
    candidates = candidates.filter((e) => e.region.toLowerCase().includes(r));
  }
  if (input.type) {
    candidates = candidates.filter((e) => e.type === input.type);
  }

  return candidates.slice(0, input.limit ?? 5);
}
