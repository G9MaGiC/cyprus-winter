"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { CHAT_SESSION_KEY, LAST_PLACE_KEY } from "@/lib/local-storage-keys";
import { getItineraryForChat } from "@/lib/itinerary-for-chat";
import { iterateSseData } from "@/lib/sse";
// getPlaceById available for future use

export type Message = {
  role: "user" | "assistant";
  content: string;
  isRetryable?: boolean;
  is503?: boolean;
};

const MAX_PERSISTED_MESSAGES = 20;

const SUGGESTIONS_BY_PATH: Record<string, string[]> = {
  "/": [
    "Plan my 3-day winter trip",
    "Best wineries with a view",
    "Artemis Trail conditions",
    "Omodos and Commandaria tasting",
    "I'm arriving tomorrow. Where do I start?",
    "Hike plus wine in one day",
  ],
  "/discover": [
    "Best wineries with a view",
    "Quiet villages for a slow day",
    "What pairs with Kourion?",
    "Omodos and nearby tastings",
    "Family-friendly places in winter",
    "Where's the best winter light?",
  ],
  "/trails": [
    "Artemis Trail conditions",
    "Best trail for this week?",
    "Easy trails for beginners",
    "Troodos snow—what to expect?",
    "Combine a trail with a village",
    "What to wear for winter hiking?",
  ],
  "/plan": [
    "Add a winery near Omodos",
    "Best route for Day 2?",
    "Fill a day with culture and wine",
    "Trails near my hotel in Platres",
    "Book tastings ahead—which wineries?",
    "Short stay: 48 hours, what to do?",
  ],
};

const DEFAULT_SUGGESTIONS = [
  "What pairs well with this place?",
  "Best time to visit?",
  "Nearby trails or villages",
  "Winter tips for here",
  "Add this to my plan",
];

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi. I know the island—trails, wineries, villages. Ask anything. Tap a suggestion, type, or use the mic.",
};

function loadPersistedMessages(): Message[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CHAT_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    const valid = parsed.filter(
      (m): m is Message =>
        m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    );
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

function getSuggestions(pathname: string): string[] {
  const normalized = pathname.replace(/^\/(en|el|de|pl)(\/|$)/, "/");
  const basePath = normalized.split("/").slice(0, 2).join("/") || "/";
  return SUGGESTIONS_BY_PATH[basePath] || DEFAULT_SUGGESTIONS;
}

export function useAIChat() {
  const pathname = usePathname();
  const locale = useLocale();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<Message[]>([INITIAL_MESSAGE]);
  const suggestions = getSuggestions(pathname);

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
            ? sessionStorage.getItem(LAST_PLACE_KEY) || undefined
            : undefined;
        const itinerary = getItineraryForChat();

        const outboundMessages = nextMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: outboundMessages,
            context: {
              path: pathname,
              lastPlace,
              itinerary,
              locale,
            },
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const isRateLimited = res.status === 429;
          const is503 = res.status === 503;
          throw new Error(
            isRateLimited
              ? "Too many requests. Please wait a moment."
              : is503
              ? "SERVICE_UNAVAILABLE"
              : "Failed to send message"
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
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;

        const is503 = (err as Error).message === "SERVICE_UNAVAILABLE";
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant" as const,
            content:
              "I'm having trouble connecting. Please try again in a moment.",
            isRetryable: true,
            is503,
          },
        ]);
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [loading, pathname, locale]
  );

  const clearChat = useCallback(() => {
    abortRef.current?.abort();
    setMessages([INITIAL_MESSAGE]);
    setInput("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(CHAT_SESSION_KEY);
    }
  }, []);

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
