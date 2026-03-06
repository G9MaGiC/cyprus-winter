/**
 * Client-side conversion tracking. Sends events to /api/track.
 * Funnel: page_view → discover_view → winery_detail_view → booking_start → booking_complete
 */
const TRACK_ENDPOINT = "/api/track";

export type EventName =
  | "page_view"
  | "discover_view"
  | "winery_detail_view"
  | "booking_start"
  | "booking_complete"
  | "shop_click"
  | "plan_add";

type EventProps = Record<string, string | number | boolean | undefined>;

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("cw_sid");
  if (!id) {
    id = `sid_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem("cw_sid", id);
  }
  return id;
}

export function track(event: EventName, properties?: EventProps): void {
  if (typeof window === "undefined") return;
  const payload = {
    event,
    properties: { ...properties, path: window.location.pathname },
    sessionId: getSessionId(),
  };
  fetch(TRACK_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}
