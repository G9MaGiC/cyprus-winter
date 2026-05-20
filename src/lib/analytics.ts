/**
 * Client-side conversion tracking. Sends events to /api/track.
 * Funnel: page_view → discover_view → winery_detail_view → booking_start → booking_complete
 * Non-essential: requires cookie consent (EU). Does not track until user accepts analytics.
 */
import { hasAnalyticsConsent } from "@/lib/cookie-consent";
import { PRODUCT_EVENTS, type ProductEventName, type TrackEventName } from "@/lib/track-events";

const TRACK_ENDPOINT = "/api/track";

export type EventName = TrackEventName;

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

function getEventId(): string {
  if (typeof window === "undefined") return "";
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `e_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function postTrack(event: string, properties?: EventProps): void {
  if (typeof window === "undefined") return;
  const payload = {
    event,
    eventId: getEventId(),
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

/** Funnel events tracked without full analytics consent (minimal properties, no PII). */
const ESSENTIAL_FUNNEL_EVENTS: readonly EventName[] = [
  "booking_start",
  "booking_complete",
  "hub_footer_click",
  "plan_add",
] as const;

export function track(event: EventName, properties?: EventProps): void {
  if (typeof window === "undefined") return;
  const essential = (ESSENTIAL_FUNNEL_EVENTS as readonly string[]).includes(event);
  if (!essential && !hasAnalyticsConsent()) return;
  postTrack(event, properties);
}

/**
 * Product analytics (plan creation) – always on.
 * Keep properties small and avoid PII.
 */
export function trackProduct(event: ProductEventName, properties?: EventProps): void {
  // Keep “always-on” events constrained to the product events allowlist.
  if (!(PRODUCT_EVENTS as readonly string[]).includes(event)) return;
  postTrack(event, properties);
}
