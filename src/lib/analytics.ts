/**
 * Client-side conversion tracking. Sends events to /api/track.
 * Marketing analytics (`track`) requires cookie consent "all".
 * First-party funnel metrics (`trackProduct`) are essential to operate Plan/Book.
 */
import { hasAnalyticsConsent } from "@/lib/cookie-consent";
import { PRODUCT_EVENTS, type ClientTrackEventName, type ProductEventName } from "@/lib/track-events";

const TRACK_ENDPOINT = "/api/track";

export type EventName = ClientTrackEventName;

type EventProps = Record<string, string | number | boolean | undefined>;

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = sessionStorage.getItem("cw_sid");
    if (!id) {
      id = `sid_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      sessionStorage.setItem("cw_sid", id);
    }
    return id;
  } catch {
    return `sid_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
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

export function track(event: EventName, properties?: EventProps): void {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;
  postTrack(event, properties);
}

/** First-party funnel metrics. Not gated on marketing-cookie consent. */
export function trackProduct(event: ProductEventName, properties?: EventProps): void {
  if (typeof window === "undefined") return;
  if (!(PRODUCT_EVENTS as readonly string[]).includes(event)) return;
  postTrack(event, properties);
}
