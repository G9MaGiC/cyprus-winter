"use client";

import { useState, useCallback, useEffect } from "react";
import { CARD } from "@/lib/design-tokens";

const CLIENT_ID_KEY = "cyprus-winter-push-client-id";

function getOrCreateClientId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = `anon-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export default function WeatherPushOptIn() {
  const [status, setStatus] = useState<"idle" | "loading" | "subscribed" | "unsupported" | "denied" | "error">("idle");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
      if (typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator) {
        if (Notification.permission === "granted") {
          // Can't know if they subscribed for weather digest specifically without an API
          setStatus("idle"); // Show opt-in; if already subscribed, API will handle upsert
        } else if (Notification.permission === "denied") {
          setStatus("denied");
        }
      } else {
        setStatus("unsupported");
      }
    });
  }, []);

  const handleSubscribe = useCallback(async () => {
    if (!("Notification" in window) || !("PushManager" in window) || !("serviceWorker" in navigator)) {
      setStatus("unsupported");
      return;
    }

    setStatus("loading");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setStatus("denied");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const vapidRes = await fetch("/api/push/vapid");
      if (!vapidRes.ok) {
        setStatus("error");
        return;
      }
      const { publicKey } = (await vapidRes.json()) as { publicKey: string };

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      const clientId = getOrCreateClientId();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          subscription: sub.toJSON(),
          tripStartDate: null,
          pushTripCountdown: false,
          pushWeatherDigest: true,
        }),
      });

      if (!res.ok) {
        setStatus("error");
        return;
      }

      setStatus("subscribed");
    } catch {
      setStatus("error");
    }
  }, []);

  if (!mounted || status === "unsupported" || status === "denied") return null;
  if (status === "subscribed") {
    return (
      <p className="text-sm text-sage">
        You&apos;re set. We&apos;ll send short weather updates up to 3 times a day.
      </p>
    );
  }

  return (
    <div className={`${CARD.base} ${CARD.content} mt-6 bg-sage/10 border-sage/30`}>
      <p className="text-sm font-medium text-olive mb-2">Weather digest</p>
      <p className="text-xs text-olive/80 mb-3">
        Get short updates (morning, midday, evening) — coast and Troodos temps. No spam.
      </p>
      <button
        type="button"
        onClick={handleSubscribe}
        disabled={status === "loading"}
        className="min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium bg-sage text-white hover:bg-sage/90 disabled:opacity-60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
      >
        {status === "loading" ? "Setting up…" : status === "error" ? "Try again" : "Turn on weather digest"}
      </button>
    </div>
  );
}
