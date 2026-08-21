"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { CHAT_SESSION_KEY, LAST_PLACE_KEY } from "@/lib/local-storage-keys";
import { getItineraryForChat } from "@/lib/itinerary-for-chat";
import { iterateSseData } from "@/lib/sse";
import { sanitizeResponseMetadata } from "@/lib/ai-response-metadata";
import { handleSlashCommand } from "../slash-commands";
import { chatBasePath, stripLocalePrefix } from "@/lib/chat-path";

export type Message = {
  role: "user" | "assistant";
  content: string;
  isRetryable?: boolean;
  is503?: boolean;
  metadata?: {
    cards?: { type: string; id: string; title: string; reason: string }[];
    actions?: { type: string; label: string; payload?: Record<string, unknown> }[];
    followUps?: string[];
  };
};

const MAX_PERSISTED_MESSAGES = 20;

type AiT = ReturnType<typeof useTranslations>;

function tList(t: AiT, prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => t(`${prefix}.${i}`));
}

const SUGGESTION_BUCKETS: Record<string, { key: string; count: number }> = {
  "/": { key: "suggestions.home", count: 6 },
  "/discover": { key: "suggestions.discover", count: 6 },
  "/trails": { key: "suggestions.trails", count: 6 },
  "/plan": { key: "suggestions.plan", count: 6 },
};

function getSuggestions(pathname: string, tAi: AiT): string[] {
  const bucket = SUGGESTION_BUCKETS[chatBasePath(pathname)];
  if (bucket) return tList(tAi, bucket.key, bucket.count);
  return tList(tAi, "suggestions.default", 5);
}

function buildContextualOpener(pathname: string, tAi: AiT): Message {
  const path = stripLocalePrefix(pathname);
  const base = tAi("opener.base");

  if (path.includes("/trails")) {
    return {
      role: "assistant",
      content: base + tAi("opener.trails"),
      metadata: { followUps: tList(tAi, "opener.followUps.trails", 3) },
    };
  }
  if (path.includes("/discover")) {
    return {
      role: "assistant",
      content: base + tAi("opener.discover"),
      metadata: { followUps: tList(tAi, "opener.followUps.discover", 3) },
    };
  }
  if (path.includes("/plan")) {
    return {
      role: "assistant",
      content: base + tAi("opener.plan"),
      metadata: { followUps: tList(tAi, "opener.followUps.plan", 3) },
    };
  }
  if (path.includes("/airport")) {
    return {
      role: "assistant",
      content: base + tAi("opener.airport"),
      metadata: { followUps: tList(tAi, "opener.followUps.airport", 3) },
    };
  }

  return {
    role: "assistant",
    content: base + tAi("opener.home"),
    metadata: { followUps: tList(tAi, "opener.followUps.home", 4) },
  };
}

function loadPersistedMessages(): Message[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CHAT_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    const valid = parsed.flatMap((raw): Message[] => {
      if (!raw || typeof raw !== "object") return [];
      const m = raw as Record<string, unknown>;
      if ((m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") {
        return [];
      }
      const metadata = m.metadata ? sanitizeResponseMetadata(m.metadata) : undefined;
      return [{
        role: m.role,
        content: m.content,
        ...(metadata && Object.keys(metadata).length > 0 ? { metadata } : {}),
      }];
    });
    return valid.length > 0 ? valid : null;
  } catch {
    return null;
  }
}

function persistMessages(messages: Message[]) {
  if (typeof window === "undefined") return;
  try {
    const toSave = messages.slice(-MAX_PERSISTED_MESSAGES);
    sessionStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(toSave));
  } catch {
    // ignore quota or parse errors
  }
}

export function useAIChat() {
  const pathname = usePathname();
  const locale = useLocale();
  const tErrors = useTranslations("errors");
  const tAi = useTranslations("common.ai");
  const initialMessage = buildContextualOpener(pathname, tAi);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<Message[]>([initialMessage]);
  const suggestions = getSuggestions(pathname, tAi);

  // Load persisted messages on mount
  useEffect(() => {
    const persisted = loadPersistedMessages();
    if (persisted) {
      setMessages(persisted);
    }
  }, []);

  // Persist messages on change
  useEffect(() => {
    messagesRef.current = messages;
    persistMessages(messages);
  }, [messages]);

  // Abort any in-flight request on unmount
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || loading) return;

      const commandReply = handleSlashCommand(content, {
        content: tAi("slash.skillsBody"),
        followUps: [
          tAi("slash.followUpPlan"),
          tAi("slash.followUpWineries"),
          tAi("slash.followUpHike"),
          tAi("slash.followUpAirport"),
        ],
      });
      if (commandReply) {
        const userMessage: Message = { role: "user", content: content.trim() };
        const withCommand = [...messagesRef.current, userMessage, commandReply];
        messagesRef.current = withCommand;
        setMessages(withCommand);
        setInput("");
        return;
      }

      const userMessage: Message = { role: "user", content: content.trim() };
      // Keep the ref in sync immediately so outbound payload is never stale.
      const nextMessages = [...messagesRef.current, userMessage];
      messagesRef.current = nextMessages;
      setMessages(nextMessages);
      setInput("");
      setLoading(true);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        // Build context
        const lastPlace =
          typeof window !== "undefined"
            ? (() => {
                try {
                  return sessionStorage.getItem(LAST_PLACE_KEY) || undefined;
                } catch {
                  return undefined;
                }
              })()
            : undefined;
        const itinerary = getItineraryForChat();

        const outboundMessages = nextMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const context: Record<string, unknown> = {
          path: pathname,
          lastPlace,
          itinerary,
          locale,
        };

        // Include cached geolocation if available
        if (typeof window !== "undefined") {
          let cachedPos: string | null = null;
          try {
            cachedPos = sessionStorage.getItem("cyprus-winter-location");
          } catch {
            cachedPos = null;
          }
          if (cachedPos) {
            try {
              context.currentLocation = JSON.parse(cachedPos);
            } catch { /* ignore */ }
          }
        }

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: outboundMessages, context }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const isRateLimited = res.status === 429;
          const is503 = res.status === 503;
          const data = await res.json().catch(() => ({} as unknown));
          const apiCode =
            typeof data === "object" && data !== null
              ? ((data as { error?: { code?: unknown } }).error?.code as unknown)
              : undefined;
          const code = typeof apiCode === "string" ? apiCode : undefined;
          throw new Error(
            isRateLimited
              ? "RATE_LIMITED"
              : is503
              ? "SERVICE_UNAVAILABLE"
              : code ?? "SERVER_ERROR"
          );
        }

        // Handle streaming response
        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        let assistantContent = "";
        for await (const data of iterateSseData(reader)) {
          let parsed: unknown;
          try {
            parsed = JSON.parse(data) as unknown;
          } catch {
            continue;
          }

          if (typeof parsed === "object" && parsed !== null && "done" in parsed && Boolean((parsed as { done?: unknown }).done)) {
            break;
          }

          if (typeof parsed === "object" && parsed !== null && "error" in parsed) {
            const errMsg = (parsed as { error?: unknown }).error;
            if (typeof errMsg === "string" && errMsg) throw new Error(errMsg);
          }

          if (typeof parsed === "object" && parsed !== null && "delta" in parsed) {
            const delta = (parsed as { delta?: unknown }).delta;
            if (typeof delta !== "string" || !delta) continue;
            assistantContent += delta;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                const updated = [...prev.slice(0, -1), { ...last, content: assistantContent }];
                messagesRef.current = updated;
                return updated;
              }
              const updated = [...prev, { role: "assistant" as const, content: assistantContent }];
              messagesRef.current = updated;
              return updated;
            });
          }

          if (
            typeof parsed === "object" &&
            parsed !== null &&
            "type" in parsed &&
            (parsed as { type?: unknown }).type === "metadata"
          ) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { type: _type, ...metadata } = parsed as Record<string, unknown>;
            const safeMetadata = sanitizeResponseMetadata(metadata);
            setMessages((prev) => {
              const updated = [...prev];
              const lastMsg = updated[updated.length - 1];
              if (lastMsg?.role === "assistant") {
                updated[updated.length - 1] = { ...lastMsg, metadata: safeMetadata };
              }
              messagesRef.current = updated;
              return updated;
            });
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;

        const msg = err instanceof Error ? err.message : "";
        const is503 = msg === "SERVICE_UNAVAILABLE";
        const isRateLimited = msg === "RATE_LIMITED";
        const content = isRateLimited
          ? tErrors("chat.rateLimited")
          : is503
            ? tErrors("chat.unavailable")
            : tErrors("chat.failed");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant" as const,
            content,
            isRetryable: true,
            is503,
          },
        ]);
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [loading, pathname, locale, tErrors, tAi]
  );

  // Handle follow-up chip selections dispatched from AIChatMessages
  useEffect(() => {
    const handler = (e: CustomEvent) => { void sendMessage(e.detail as string); };
    window.addEventListener("ai-followup", handler as EventListener);
    return () => window.removeEventListener("ai-followup", handler as EventListener);
  }, [sendMessage]);

  const clearChat = useCallback(() => {
    abortRef.current?.abort();
    setMessages([buildContextualOpener(pathname, tAi)]);
    setInput("");
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(CHAT_SESSION_KEY);
      } catch {
        // Storage can be unavailable in privacy modes.
      }
    }
  }, [pathname, tAi]);

  return {
    messages,
    input,
    setInput,
    loading,
    suggestions,
    sendMessage,
    clearChat,
  };
}
