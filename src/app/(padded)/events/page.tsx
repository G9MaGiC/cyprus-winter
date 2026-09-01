import EventsPageClient from "./EventsPageClient";
import { SEASON_BY_JS_MONTH } from "./season-months";

export default function EventsPage() {
  // Computed server-side per request (the root layout keeps every route
  // request-rendered) and passed down, so SSR and hydration agree on the
  // anchor month. Out of season it stays null → season order unchanged.
  const seasonAnchor = SEASON_BY_JS_MONTH[new Date().getMonth()] ?? null;
  return <EventsPageClient seasonAnchor={seasonAnchor} />;
}
