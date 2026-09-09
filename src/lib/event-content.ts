import "server-only";
import { getTranslations } from "next-intl/server";
import type { WinterEvent } from "@/data/events";

/**
 * BUG-110 message-overlay pattern for the winter events — data-layer arc,
 * class 6: per-locale copy lives under `data.events.{id}.*` and is overlaid
 * onto the base TS record before rendering (the /events page localizes
 * server-side and passes the array across the client boundary as a prop,
 * same as the nature/cycling sections). Coverage is explicit in
 * LOCALIZED_EVENT_IDS while the class ships in slices. The el `name` matches
 * the record's `nameEl` where one exists (guard-tested), so the Greek-first
 * projection and the overlay never disagree. Search indexing, JSON-LD,
 * right-now scoring and the AI tools keep reading the EN base.
 */

export {
  LOCALIZED_EVENT_FIELDS,
  LOCALIZED_EVENT_IDS,
  type LocalizedEventField,
} from "@/lib/event-content-ids";
import { LOCALIZED_EVENT_FIELDS, LOCALIZED_EVENT_IDS } from "@/lib/event-content-ids";

export async function localizeEvents(
  events: WinterEvent[],
  locale?: string
): Promise<WinterEvent[]> {
  if (!events.some((e) => LOCALIZED_EVENT_IDS.has(e.id))) return events;
  const t = locale
    ? await getTranslations({ locale, namespace: "data.events" })
    : await getTranslations("data.events");
  return events.map((event) => {
    if (!LOCALIZED_EVENT_IDS.has(event.id)) return event;
    const overlaid: Record<string, string> = {};
    for (const field of LOCALIZED_EVENT_FIELDS) {
      if (event[field]) overlaid[field] = t(`${event.id}.${field}`);
    }
    return { ...event, ...overlaid };
  });
}
