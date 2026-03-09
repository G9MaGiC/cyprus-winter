"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { LAST_PLACE_KEY } from "@/lib/local-storage-keys";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import ReactMarkdown from "react-markdown";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import { getPlaceById } from "@/data";
import { isSafeUrl } from "@/lib/safe-url";
import { OPEN_AI_EVENT } from "./AIAssistantTrigger";
import { LAYOUT } from "@/lib/design-tokens";

/** Horizontal padding matching LAYOUT.safeAreaX for panel sections */
const PANEL_PX = LAYOUT.safeAreaX;

type Message = { role: "user" | "assistant"; content: string; isRetryable?: boolean; is503?: boolean };

const SUGGESTIONS_HOME = [
  "Plan my 3-day winter trip",
  "Best wineries with a view",
  "Artemis Trail conditions",
  "Omodos and Commandaria tasting",
  "I'm arriving tomorrow. Where do I start?",
  "Hike plus wine in one day",
];

const SUGGESTIONS_DISCOVER = [
  "Best wineries with a view",
  "Quiet villages for a slow day",
  "What pairs with Kourion?",
  "Omodos and nearby tastings",
  "Family-friendly places in winter",
  "Where's the best winter light?",
];

const SUGGESTIONS_TRAILS = [
  "Artemis Trail conditions",
  "Best trail for this week?",
  "Easy trails for beginners",
  "Troodos snow—what to expect?",
  "Combine a trail with a village",
  "What to wear for winter hiking?",
];

const SUGGESTIONS_PLAN = [
  "Add a winery near Omodos",
  "Best route for Day 2?",
  "Fill a day with culture and wine",
  "Trails near my hotel in Platres",
  "Book tastings ahead—which wineries?",
  "Short stay: 48 hours, what to do?",
];

const SUGGESTIONS_DETAIL = [
  "What pairs well with this place?",
  "Best time to visit?",
  "Nearby trails or villages",
  "Winter tips for here",
  "Add this to my plan",
];

function getSuggestions(pathname: string | null): string[] {
  if (!pathname) return SUGGESTIONS_HOME;
  if (pathname.startsWith("/trails/") && pathname !== "/trails") return SUGGESTIONS_DETAIL;
  if (pathname.startsWith("/discover/") || pathname.startsWith("/book/winery/")) return SUGGESTIONS_DETAIL;
  if (pathname.startsWith("/trails")) return SUGGESTIONS_TRAILS;
  if (pathname.startsWith("/discover")) return SUGGESTIONS_DISCOVER;
  if (pathname.startsWith("/plan")) return SUGGESTIONS_PLAN;
  return SUGGESTIONS_HOME;
}

export default function AIAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi. I know the island—trails, wineries, villages. Ask anything. Tap a suggestion, type, or use the mic.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = messagesEndRef.current;
    if (!el) return;
    const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(OPEN_AI_EVENT, handler);
    return () => window.removeEventListener(OPEN_AI_EVENT, handler);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => {
        clearTimeout(t);
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
      triggerButtonRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const el = panelRef.current;
      const focusable = el.querySelectorAll<HTMLElement>(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const handleFocusIn = (e: FocusEvent) => {
      if (!panelRef.current || !open) return;
      const target = e.target as Node;
      if (!panelRef.current.contains(target)) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        const toFocus = focusable[0] ?? inputRef.current;
        if (toFocus) requestAnimationFrame(() => toFocus.focus());
      }
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("focusin", handleFocusIn, true);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("focusin", handleFocusIn, true);
    };
  }, [open]);

  const sendMessage = async (text: string, isRetry = false) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    abortControllerRef.current?.abort();
    const ac = new AbortController();
    abortControllerRef.current = ac;

    const messagesToSend = isRetry
      ? messages.slice(0, -1)
      : [...messages, { role: "user" as const, content: trimmed }];

    setInput("");
    setInterimTranscript("");
    setMessages((prev) => (isRetry ? prev.slice(0, -1) : [...prev, { role: "user" as const, content: trimmed }]));
    setLoading(true);

    try {
      const lastPlace = typeof window !== "undefined" ? localStorage.getItem(LAST_PLACE_KEY) : null;
      const headers: HeadersInit = { "Content-Type": "application/json" };
      const supabase = getSupabaseBrowser();
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (token) headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: messagesToSend,
          context: {
            path: pathname ?? undefined,
            lastPlace: lastPlace ?? undefined,
          },
        }),
        signal: ac.signal,
      });

      if (!isMountedRef.current) return;

      let data: { reply?: string; message?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        if (res.status === 503) throw new Error("AI_503");
        throw new Error(`Request failed (${res.status})`);
      }

      if (!isMountedRef.current) return;

      if (!res.ok) {
        if (res.status === 503) throw new Error("AI_503");
        if (res.status === 429) throw new Error("RATE_LIMIT");
        const d = data as { reply?: string; error?: unknown; message?: string };
        const raw = d.reply ?? (typeof d.error === "object" ? (d.error as { message?: string })?.message : d.error) ?? d.message ?? `Request failed (${res.status})`;
        const msg: string = typeof raw === "string" ? raw : String(raw ?? "");
        if (/429|quota|usage limit/i.test(msg)) throw new Error("PROVIDER_LIMIT");
        if (msg.includes("401") || /invalid authentication|api key/i.test(msg)) {
          throw new Error("Auth failed. Check that your API key is valid and has credits.");
        }
        throw new Error(msg);
      }

      if (!isMountedRef.current) return;

      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply ?? "Didn't get that one. Try again, or browse Discover and Trails for Troodos, Lefkara, Kourion." },
      ]);
    } catch (err) {
      if (!isMountedRef.current) return;
      if (err instanceof Error && err.name === "AbortError") return;

      const msg = err instanceof Error ? err.message : "";
      const is503 = msg === "AI_503";
      const isAuth = msg.includes("401") || /invalid authentication|auth failed|api key/i.test(msg);
      const isRateLimit = msg === "RATE_LIMIT" || msg === "PROVIDER_LIMIT" || msg.includes("429") || /quota|usage limit/i.test(msg);
      const fallback = "Something hiccuped. Try again in a moment, or browse Discover and Trails for ideas.";
      const content503 = "Can't reach the guide right now. Browse Discover or Trails for ideas.";
      const contentAuth = "Can't reach the guide right now. Try again later, or browse Discover and Trails for ideas.";
      const contentRateLimit = "Too many messages. Wait a moment, then try again.";
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: is503
            ? content503
            : isAuth
              ? contentAuth
              : isRateLimit
                ? contentRateLimit
                : msg || fallback,
          isRetryable: isRateLimit,
          is503,
        },
      ]);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const startListening = () => {
    setVoiceError(null);
    setInterimTranscript("");
    const RecognitionAPI =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || (window as Window & { webkitSpeechRecognition?: new () => globalThis.SpeechRecognition }).webkitSpeechRecognition);

    if (!RecognitionAPI) {
      setVoiceError("Voice isn't supported in this browser. Type instead.");
      return;
    }

    const recognition = new RecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-GB";

    recognition.onstart = () => setListening(true);
    recognition.onend = () => {
      setListening(false);
      setInterimTranscript("");
    };
    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      setListening(false);
      setInterimTranscript("");
      if (e.error === "not-allowed") {
        setVoiceError("Mic access denied. Allow in browser settings, or type your question.");
      } else if (e.error === "no-speech") {
        setVoiceError("No speech heard. Try again.");
      } else {
        setVoiceError("Couldn't hear you. Try again or type it.");
      }
    };
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let final = "";
      let interim = "";
      for (let i = 0; i < e.results.length; i++) {
        const result = e.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      if (interim) setInterimTranscript(interim);
      if (final.trim()) {
        setInterimTranscript("");
        sendMessage(final.trim());
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
    setInterimTranscript("");
  };

  const speakReply = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (synthRef.current?.speaking) {
      window.speechSynthesis.cancel();
    }

    setSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-GB";
    utterance.rate = 0.92;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    synthRef.current = window.speechSynthesis;
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  };

  return (
    <>
      {/* Floating trigger — terracotta primary, Mediterranean warmth */}
      <button
        ref={triggerButtonRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ask your guide"
        aria-expanded={open}
        className={`fixed right-[max(1.5rem,env(safe-area-inset-right))] sm:right-6 ${LAYOUT.fixedBottomClearance} sm:bottom-6 z-40 min-h-[48px] min-w-[48px] w-14 h-14 rounded-full bg-terracotta text-white shadow-lg hover:bg-terracotta-muted hover:shadow-xl active:scale-[0.97] transition-all duration-200 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-manipulation ai-chat-trigger-pulse`}
      >
        <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop — mobile only, tap to dismiss */}
          <div
            className="fixed inset-0 z-50 bg-charcoal/10 sm:hidden"
            onClick={() => setOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            aria-hidden
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-dialog-title"
            aria-label="Cyprus Winter guide"
            className="fixed inset-0 z-[51] flex flex-col bg-background sm:inset-auto sm:bottom-6 sm:right-6 sm:left-auto sm:top-auto sm:w-[min(420px,calc(100vw-2rem))] sm:max-h-[calc(100vh-5rem)] lg:max-h-[min(560px,calc(100vh-6rem))] sm:rounded-2xl sm:shadow-2xl sm:border sm:border-sand-200/80 sm:backdrop-blur-sm overflow-hidden min-h-[100dvh] sm:min-h-0 ai-chat-panel-enter"
          >
          {/* Header — charcoal + terracotta accent, Mediterranean warmth */}
          <header className={`flex items-center justify-between gap-2 ${PANEL_PX} py-3 sm:py-4 pt-[max(1rem,env(safe-area-inset-top))] bg-charcoal text-white shrink-0 border-b border-white/10`}>
            <div className="min-w-0 flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-terracotta/20 text-terracotta" aria-hidden>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </span>
              <div>
                <h2 id="ai-dialog-title" className="font-display font-semibold text-base truncate">Cyprus Winter</h2>
                <p className="text-xs text-white/80">Ask or speak</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setMessages([{
                  role: "assistant",
                  content:
                    "Hi. I know the island—trails, wineries, villages. Ask anything. Tap a suggestion, type, or use the mic.",
                }])}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-medium text-white/90 hover:bg-white/10 active:bg-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal touch-manipulation"
                aria-label="New chat"
              >
                New
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl hover:bg-white/10 active:bg-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal touch-manipulation"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </header>

          {/* Messages - flex-1, scrollable, fills available space */}
          <div
            className={`flex-1 min-h-0 overflow-y-auto overscroll-contain ${PANEL_PX} py-5 sm:py-6 space-y-5`}
            aria-live="polite"
            aria-busy={loading}
            role="log"
            aria-label="Chat messages"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-xl px-5 py-3.5 border ${
                    m.role === "user"
                      ? "bg-terracotta text-white border-terracotta/80 rounded-br-md shadow-sm"
                      : "bg-sand-100 text-olive border-l-4 border-l-terracotta/30 border border-sand-200/80 rounded-bl-md"
                  }`}
                >
                  <div className="text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap [&_a]:text-sage [&_a]:underline [&_a]:break-all">
                    {m.role === "assistant" ? (
                      <AssistantMessage
                        content={m.content}
                        onSpeak={speakReply}
                        onStopSpeak={stopSpeaking}
                        speaking={speaking}
                        isRetryable={m.isRetryable}
                        is503={m.is503}
                        onRetry={() => {
                          const lastUser = [...messages].reverse().find((x) => x.role === "user");
                          if (lastUser) sendMessage(lastUser.content, true);
                        }}
                      />
                    ) : (
                      m.content
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start" aria-live="polite">
                <div className="bg-sand-100 border-l-4 border-l-terracotta/30 border border-sand-200/80 rounded-xl rounded-bl-md px-5 py-3.5 flex items-center gap-2">
                  <span className="flex gap-1 motion-reduce:animate-none" aria-hidden>
                    <span className="w-2 h-2 rounded-full bg-terracotta/70 animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-terracotta/70 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-terracotta/70 animate-bounce [animation-delay:300ms]" />
                  </span>
                  <span className="text-sm text-olive/80">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice: listening strip — aegean accent, clear feedback */}
          {listening && (
            <div
              className={`shrink-0 ${PANEL_PX} py-3 bg-aegean/10 border-y border-aegean/20 flex items-center gap-3`}
              role="status"
              aria-live="polite"
              aria-label="Listening for your question"
            >
              <span className="flex shrink-0 w-10 h-10 rounded-full bg-aegean/20 items-center justify-center motion-reduce:animate-none" aria-hidden>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aegean opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-aegean" />
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-aegean">Listening…</p>
                {interimTranscript && (
                  <p className="text-sm text-olive/80 truncate mt-0.5">&ldquo;{interimTranscript}&rdquo;</p>
                )}
              </div>
              <button
                type="button"
                onClick={stopListening}
                className="shrink-0 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl bg-aegean text-white text-sm font-medium hover:bg-aegean/90 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-manipulation"
                aria-label="Stop listening"
              >
                Stop
              </button>
            </div>
          )}

          {/* Suggestions — PILL neutral, terracotta hover */}
          {messages.length <= 2 && !listening && (
            <div className={`shrink-0 ${PANEL_PX} pb-3`}>
              <p className="text-xs text-olive-muted mb-2 prose-label">Try one, or ask your own</p>
              <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 scrollbar-none snap-x snap-mandatory overscroll-x-contain scroll-touch [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
                {getSuggestions(pathname).slice(0, 6).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    disabled={loading}
                    className="shrink-0 snap-start min-h-[44px] px-4 py-2.5 rounded-full text-sm font-medium bg-sand-200/80 text-olive border border-sand-200/80 hover:border-terracotta/30 hover:bg-terracotta/10 hover:text-terracotta active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-manipulation"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Voice error — sand surface, clear dismiss */}
          {voiceError && (
            <div className={`shrink-0 ${PANEL_PX} py-3 flex items-center justify-between gap-3 bg-sand-100 border-t border-sand-200/80`} role="alert">
              <p className="text-sm text-olive break-words flex-1 min-w-0">{voiceError}</p>
              <button
                type="button"
                onClick={() => setVoiceError(null)}
                className="shrink-0 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-sm font-medium text-olive hover:text-terracotta rounded-xl hover:bg-terracotta/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-manipulation"
                aria-label="Dismiss"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Input bar — terracotta primary, design tokens */}
          <form
            onSubmit={handleSubmit}
            className={`shrink-0 ${PANEL_PX} py-5 sm:py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] border-t border-sand-200/80 flex gap-3 items-end bg-background`}
          >
            <div className="flex-1 min-w-0 relative flex items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                aria-label="Type your question about trails, wineries, or trip planning"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask about trails, wineries, villages…"
                rows={1}
                disabled={loading}
                className="w-full min-h-[44px] max-h-32 resize-none rounded-xl border border-sand-200/80 bg-sand-100/50 px-4 py-3 pr-14 text-base leading-relaxed text-olive placeholder:text-olive-muted focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta/50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation transition-colors"
              />
              <button
                type="button"
                onClick={listening ? stopListening : startListening}
                className={`absolute right-2 bottom-2 flex items-center justify-center rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background min-h-[44px] min-w-[44px] touch-manipulation ${
                  listening
                    ? "bg-terracotta/20 text-terracotta hover:bg-terracotta/30 active:scale-[0.97]"
                    : "bg-sand-200 text-olive hover:bg-terracotta/10 hover:text-terracotta active:scale-[0.97]"
                }`}
                aria-label={listening ? "Stop listening" : "Tap to speak"}
              >
                <MicIcon listening={listening} />
              </button>
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="shrink-0 min-h-[44px] px-5 py-2.5 rounded-xl bg-terracotta text-white font-medium text-sm hover:bg-terracotta-muted active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-manipulation"
              aria-label="Send message"
            >
              Send
            </button>
          </form>
        </div>
        </>
      )}
    </>
  );
}

function MicIcon({ listening }: { listening: boolean }) {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      {listening ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-4a4 4 0 01-8 0V9a4 4 0 118 0v2z"
        />
      )}
    </svg>
  );
}

function AssistantMessage({
  content,
  onSpeak,
  onStopSpeak,
  speaking,
  isRetryable,
  is503,
  onRetry,
}: {
  content: string;
  onSpeak: (t: string) => void;
  onStopSpeak: () => void;
  speaking: boolean;
  isRetryable?: boolean;
  is503?: boolean;
  onRetry?: () => void;
}) {
  const plainText = content.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  return (
    <div>
      <span className="[&_a]:text-terracotta [&_a]:underline [&_a]:break-all [&_p]:mb-1 last:[&_p]:mb-0">
        <ReactMarkdown
          components={{
            a: ({ href, children }) => {
              const url = href ?? "";
              const safe = isSafeUrl(url);
              const placeMatch = url.match(/^\/(trails|discover)\/([^/?#]+)/);
              const place = placeMatch ? getPlaceById(placeMatch[2]) : undefined;
              return (
                <span className="inline-flex flex-wrap items-center gap-1.5">
                  {safe ? (
                    <a
                      href={url}
                      rel={url.startsWith("http") ? "noopener noreferrer" : undefined}
                      target={url.startsWith("http") ? "_blank" : undefined}
                      className="text-terracotta underline underline-offset-2 hover:text-terracotta-muted break-all transition-colors"
                    >
                      {children}
                    </a>
                  ) : (
                    <span className="text-olive/80 break-all">{children}</span>
                  )}
                  {place && (
                    <AddToItineraryButton placeId={place.id} label="Add" className="min-h-[44px] min-w-[44px] justify-center px-4 py-2.5 text-sm" />
                  )}
                </span>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </span>
      <div className="flex flex-wrap items-center gap-2 mt-2">
        {is503 && (
          <span className="flex flex-wrap gap-2">
            <Link
              href="/discover"
              prefetch="auto"
              className="min-h-[44px] inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-terracotta hover:bg-terracotta/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-1"
            >
              Browse Discover
            </Link>
            <Link
              href="/trails"
              prefetch="auto"
              className="min-h-[44px] inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-terracotta hover:bg-terracotta/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-1"
            >
              View trails
            </Link>
          </span>
        )}
        {isRetryable && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="min-h-[44px] inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-terracotta hover:bg-terracotta/10 active:scale-[0.98] transition-all touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-1"
          >
            Retry
          </button>
        )}
        <button
          type="button"
          onClick={() => (speaking ? onStopSpeak() : onSpeak(plainText))}
          className="min-h-[44px] inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-olive/80 hover:text-terracotta hover:bg-terracotta/5 active:scale-[0.98] transition-all touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-1"
          aria-label={speaking ? "Stop speaking" : "Listen to response"}
        >
          {speaking ? (
            <>
              <span className="relative flex h-2 w-2 motion-reduce:animate-none" aria-hidden>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75" />
                <span className="relative rounded-full h-2 w-2 bg-sage" />
              </span>
              Stop
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              Listen
            </>
          )}
        </button>
      </div>
    </div>
  );
}
