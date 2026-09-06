import EventsPageClient from "./EventsPageClient";
import { SEASON_BY_JS_MONTH } from "./season-months";
import { winterEvents } from "@/data/events";
import { localizeEvents } from "@/lib/event-content";

export default async function EventsPage() {
  // Computed server-side per request (the root layout keeps every route
  // request-rendered) and passed down, so SSR and hydration agree on the
  // anchor month. Out of season it stays null → season order unchanged.
  const seasonAnchor = SEASON_BY_JS_MONTH[new Date().getMonth()] ?? null;
  // Event prose localizes server-side and crosses the client boundary as a
  // prop (data-layer arc) — same pattern as the nature/cycling sections.
  const events = await localizeEvents(winterEvents);
  return <EventsPageClient seasonAnchor={seasonAnchor} events={events} />;
}
