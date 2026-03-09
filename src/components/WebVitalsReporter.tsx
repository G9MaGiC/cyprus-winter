"use client";

import { useEffect } from "react";
import { onCLS, onFCP, onLCP, onINP, onTTFB } from "web-vitals";
import { hasAnalyticsConsent } from "@/lib/cookie-consent";

const TRACK_ENDPOINT = "/api/track";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("cw_sid");
  if (!id) {
    id = `sid_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem("cw_sid", id);
  }
  return id;
}

function sendWebVital(metric: string, value: number, rating: string) {
  if (!hasAnalyticsConsent()) return;
  fetch(TRACK_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "web_vital",
      sessionId: getSessionId(),
      properties: {
        metric,
        value: Math.round(value * 1000) / 1000,
        rating,
        path: window.location.pathname,
      },
    }),
    keepalive: true,
  }).catch(() => {});
}

export default function WebVitalsReporter() {
  useEffect(() => {
    onCLS((m) => sendWebVital(m.name, m.value, m.rating));
    onFCP((m) => sendWebVital(m.name, m.value, m.rating));
    onLCP((m) => sendWebVital(m.name, m.value, m.rating));
    onINP((m) => sendWebVital(m.name, m.value, m.rating));
    onTTFB((m) => sendWebVital(m.name, m.value, m.rating));
  }, []);
  return null;
}
