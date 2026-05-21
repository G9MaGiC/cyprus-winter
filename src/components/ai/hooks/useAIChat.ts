"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { CHAT_SESSION_KEY, LAST_PLACE_KEY } from "@/lib/local-storage-keys";
import { getItineraryForChat } from "@/lib/itinerary-for-chat";
import { iterateSseData } from "@/lib/sse";
import {
  sanitizeResponseMetadata,
  sanitizeStoredChatMessages,
  type AIResponseMetadata,
} from "@/lib/ai-response-metadata";
// getPlaceById available for future use

export type Message = {
  role: "user" | "assistant";
  content: string;
  isRetryable?: boolean;
  is503?: boolean;
  metadata?: AIResponseMetadata;
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

function buildContextualOpener(path: string): Message {
  const base = "Hi — I know the island. ";

  if (path.includes("/trails")) {
    return {
      role: "assistant",
      content: base + "Looking for a trail? I can help match one to today's weather and your fitness level.",
      metadata: {
        followUps: ["Easy winter hike", "Trail conditions today", "Combine a trail with a village"],
      },
    };
  }
  if (path.includes("/discover")) {
    return {
      role: "assistant",
      content: base + "Exploring places? Tell me your region or what you're in the mood for — I'll narrow it down.",
      metadata: {
        followUps: ["Best villages near me", "Hidden beaches", "Family-friendly picks"],
      },
    };
  }
  if (path.includes("/plan")) {
    return {
      role: "assistant",
      content: base + "Building your plan? I can suggest what fits each day, or fill gaps in your itinerary.",
      metadata: {
        followUps: ["Plan my day", "Best route for Day 1", "Add a winery stop"],
      },
    };
  }
  if (path.includes("/airport")) {
    return {
      role: "assistant",
      content: base + "Just arrived or planning to? I can help with transport, first stops, and your opening day.",
      metadata: {
        followUps: ["I just landed in Larnaca", "Transport to Limassol", "What to do first"],
      },
    };
  }

  return {
    role: "assistant",
    content: base + "Trails, wineries, villages, day plans — ask anything, or tap a suggestion below.",
    metadata: {
      followUps: [
        "Plan my 3-day trip",
        "Best wineries with a view",
        "What should I do today?",
        "Easy winter hike",
      ],
    },
  };
}

function loadPersistedMessages(): Message[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CHAT_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return sanitizeStoredChatMessages(parsed);
  } catch {
    return null;
  }
}

function persistMessages(messages: Message[]) {
  if (typeof window === "undefined") return;
  try {
    const toSave = sanitizeStoredChatMessages(messages.slice(-MAX_PERSISTED_MESSAGES)) ?? [];
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
  const tErrors = useTranslations("errors");
  const initialMessage = buildContextualOpener(pathname);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<Message[]>([initialMessage]);
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

        const context: Record<string, unknown> = {
          path: pathname,
          lastPlace,
          itinerary,
          locale,
        };

        // Include cached geolocation if available
        if (typeof window !== "undefined") {
          const cachedPos = sessionStorage.getItem("cyprus-winter-location");
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
                updated[updated.length - 1] = Object.keys(safeMetadata).length > 0
                  ? { ...lastMsg, metadata: safeMetadata }
                  : { ...lastMsg };
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
    [loading, pathname, locale, tErrors]
  );

  // Handle follow-up chip selections dispatched from AIChatMessages
  useEffect(() => {
    const handler = (e: CustomEvent) => { void sendMessage(e.detail as string); };
    window.addEventListener("ai-followup", handler as EventListener);
    return () => window.removeEventListener("ai-followup", handler as EventListener);
  }, [sendMessage]);

  const clearChat = useCallback(() => {
    abortRef.current?.abort();
    setMessages([buildContextualOpener(pathname)]);
    setInput("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(CHAT_SESSION_KEY);
    }
  }, [pathname]);

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
