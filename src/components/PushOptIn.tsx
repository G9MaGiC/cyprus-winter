"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { CARD } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

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

type Props = {
  tripStartDate: string | null;
  onSubscribed?: () => void;
  /** "soon" = within 7 days, "far" = beyond 7 days (softer copy) */
  variant?: "soon" | "far";
};

export default function PushOptIn({ tripStartDate, onSubscribed, variant = "soon" }: Props) {
  const tPush = useTranslations("push.trip");
  const [status, setStatus] = useState<"idle" | "loading" | "subscribed" | "unsupported" | "denied" | "error" | "notConfigured">("idle");
  const [mounted, setMounted] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Hydration: detect push support and permission after mount
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only initialization
    setMounted(true);
    if (typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator) {
      if (Notification.permission === "granted") setStatus("subscribed");
      else if (Notification.permission === "denied") setStatus("denied");
    } else {
      setStatus("unsupported");
    }
  }, []);

  const handleSubscribe = useCallback(async () => {
    if (!("Notification" in window) || !("PushManager" in window) || !("serviceWorker" in navigator)) {
      setStatus("unsupported");
      return;
    }

    setStatus("loading");
    try {
      const perm = await Notification.requestPermission();
      if (!isMountedRef.current) return;
      if (perm !== "granted") {
        setStatus("denied");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" });
      await navigator.serviceWorker.ready;
      if (!isMountedRef.current) return;

      const vapidRes = await fetch("/api/push/vapid");
      if (!vapidRes.ok) {
        if (isMountedRef.current) setStatus(vapidRes.status === 503 ? "notConfigured" : "error");
        return;
      }
      const vapidJson = (await vapidRes.json()) as { publicKey?: string };
      const publicKey = vapidJson?.publicKey;
      if (!publicKey) {
        if (isMountedRef.current) setStatus("notConfigured");
        return;
      }
      if (!isMountedRef.current) return;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });
      if (!isMountedRef.current) return;

      const clientId = getOrCreateClientId();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          subscription: sub.toJSON(),
          tripStartDate: tripStartDate ?? null,
          pushTripCountdown: true,
        }),
      });

      if (!res.ok) {
        if (isMountedRef.current) setStatus(res.status === 503 ? "notConfigured" : "error");
        return;
      }

      if (isMountedRef.current) {
        setStatus("subscribed");
        onSubscribed?.();
      }
    } catch {
      if (isMountedRef.current) setStatus("error");
    }
  }, [tripStartDate, onSubscribed]);

  if (!mounted || status === "unsupported" || status === "denied" || status === "notConfigured") return null;
  if (status === "subscribed") {
    return (
      <p className="text-sm text-sage mt-2">
        {tPush("subscribed")}
      </p>
    );
  }

  return (
    <div className={`${CARD.base} ${CARD.content} mt-4 bg-aegean/5 border-aegean/20`}>
      <p className="text-sm font-medium text-olive mb-2">{tPush("title")}</p>
      <p className="text-xs text-olive/80 mb-3">
        {variant === "far" ? tPush("bodyFar") : tPush("bodySoon")}
      </p>
      <button
        type="button"
        onClick={handleSubscribe}
        disabled={status === "loading"}
        className="min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium bg-aegean text-white hover:bg-aegean/90 disabled:opacity-60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {status === "loading"
          ? tPush("buttonLoading")
          : status === "error"
            ? tPush("buttonError")
            : tPush("buttonIdle")}
      </button>
    </div>
  );
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
