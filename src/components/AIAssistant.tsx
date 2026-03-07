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

type Message = { role: "user" | "assistant"; content: string; isRetryable?: boolean; is503?: boolean };

const SUGGESTIONS = [
  "Plan my 3-day winter trip",
  "Best wineries with a view",
  "Artemis Trail conditions",
  "Omodos and Commandaria tasting",
  "What should I do in Omodos?",
  "Hike plus wine in one day",
  "Quiet villages for a slow day",
  "Where's the best winter light?",
  "I'm arriving tomorrow. Where do I start?",
];

export default function AIAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi. I'm your Cyprus Winter guide. Ask about trails, wineries, villages, or how to plan your trip. Tap a suggestion, type, or use the mic. I'll point you to real places (Troodos, Omodos, Nissi) and practical tips.",
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
      });

      let data: { reply?: string; message?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        if (res.status === 503) throw new Error("AI_503");
        throw new Error(`Request failed (${res.status})`);
      }

      if (!res.ok) {
        if (res.status === 503) throw new Error("AI_503");
        const msg = data.reply || data.error || `Request failed (${res.status})`;
        if (msg.includes("429") || msg.toLowerCase().includes("quota")) {
          throw new Error("We've hit a usage limit for now. Try again later.");
        }
        throw new Error(msg);
      }

      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply ?? "Didn't get that one. Try again, or browse Discover and Trails for Troodos, Lefkara, Kourion." },
      ]);
    } catch (err) {
      const is429 = err instanceof Error && (
        err.message.includes("429") ||
        err.message.toLowerCase().includes("quota") ||
        err.message.toLowerCase().includes("limit")
      );
      const is503 = err instanceof Error && err.message === "AI_503";
      const fallback = "Something hiccuped. Try again in a moment, or browse Discover and Trails for ideas.";
      const content503 = "Assistant isn't available right now. Browse Discover or Trails for ideas.";
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: is503
            ? content503
            : is429 && err instanceof Error
              ? `Sorry: ${err.message}`
              : (err instanceof Error ? fallback : "Something went wrong. Try again."),
          isRetryable: is429,
          is503,
        },
      ]);
    } finally {
      setLoading(false);
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
      {/* Floating trigger — Mediterranean bubble, pulse hint, 44px+ touch target */}
      <button
        ref={triggerButtonRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open AI assistant"
        aria-expanded={open}
        className="fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:right-6 md:bottom-6 z-40 min-h-[48px] min-w-[48px] w-14 h-14 rounded-full bg-sage text-white shadow-lg hover:bg-sage/90 hover:shadow-xl active:scale-[0.97] transition-all duration-200 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-manipulation ai-chat-trigger-pulse"
      >
        <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-dialog-title"
          aria-label="Cyprus Winter AI assistant"
          className="fixed inset-0 z-50 flex flex-col bg-background sm:inset-auto sm:bottom-6 sm:right-6 sm:left-auto sm:top-auto sm:w-[420px] sm:max-h-[calc(100vh-5rem)] sm:rounded-2xl sm:shadow-2xl sm:border sm:border-sand-200 overflow-hidden min-h-[100dvh] sm:min-h-0 ai-chat-panel-enter"
        >
          {/* Header — charcoal + aegean accent, Mediterranean feel */}
          <header className="flex items-center justify-between gap-2 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] bg-[var(--surface-dark)] text-white shrink-0 border-b border-white/10">
            <div className="min-w-0 flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-aegean/30 text-sage" aria-hidden>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </span>
              <div>
                <h2 id="ai-dialog-title" className="font-display font-semibold text-base truncate">Cyprus Winter AI</h2>
                <p className="text-xs text-white/70">Ask or speak</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setMessages([{
                  role: "assistant",
                  content:
                    "Hi. I'm your Cyprus Winter guide. Ask about trails, wineries, villages, or how to plan your trip. Tap a suggestion, type, or use the mic. I'll point you to real places (Troodos, Omodos, Nissi) and practical tips.",
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
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4"
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
                  className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-3 border ${
                    m.role === "user"
                      ? "bg-sage text-white border-sage/80 rounded-br-md shadow-sm"
                      : "bg-sand-100 text-olive border-sand-200 rounded-bl-md"
                  }`}
                >
                  <div className="text-base sm:text-sm leading-relaxed whitespace-pre-wrap [&_a]:text-sage [&_a]:underline [&_a]:break-all">
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
                <div className="bg-sand-100 border border-sand-200 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                  <span className="flex gap-1 motion-reduce:animate-none" aria-hidden>
                    <span className="w-2 h-2 rounded-full bg-sage/70 animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-sage/70 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-sage/70 animate-bounce [animation-delay:300ms]" />
                  </span>
                  <span className="text-sm text-olive/80">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice: listening strip — Mediterranean accent, clear feedback */}
          {listening && (
            <div
              className="shrink-0 px-4 py-3 bg-aegean/10 border-y border-aegean/25 flex items-center gap-3"
              role="status"
              aria-live="polite"
              aria-label="Listening for your question"
            >
              <span className="flex shrink-0 w-10 h-10 rounded-full bg-sage/20 items-center justify-center motion-reduce:animate-none" aria-hidden>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-sage" />
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-sage">Listening…</p>
                {interimTranscript && (
                  <p className="text-sm text-olive/80 truncate mt-0.5">&ldquo;{interimTranscript}&rdquo;</p>
                )}
              </div>
              <button
                type="button"
                onClick={stopListening}
                className="shrink-0 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl bg-sage text-white text-sm font-medium hover:bg-sage/90 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-manipulation"
                aria-label="Stop listening"
              >
                Stop
              </button>
            </div>
          )}

          {/* Suggestions — chip style, horizontal scroll, hover feedback */}
          {messages.length <= 2 && !listening && (
            <div className="shrink-0 px-4 pb-2">
              <p className="text-xs text-olive-muted mb-2 prose-label">Try one, or ask your own</p>
              <div className="flex gap-2.5 sm:gap-2 overflow-x-auto pb-1 -mx-1 scrollbar-none snap-x snap-mandatory overscroll-x-contain scroll-touch">
                {SUGGESTIONS.slice(0, 6).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    disabled={loading}
                    className="shrink-0 snap-start min-h-[44px] px-4 py-2.5 rounded-full text-sm font-medium bg-sand-100 text-olive border border-sand-200/80 hover:border-sage/30 hover:bg-sage/5 hover:text-sage active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-manipulation"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Voice error — sand surface, clear dismiss */}
          {voiceError && (
            <div className="shrink-0 px-4 py-3 flex items-center justify-between gap-3 bg-sand-100 border-t border-sand-200" role="alert">
              <p className="text-sm text-olive break-words flex-1 min-w-0">{voiceError}</p>
              <button
                type="button"
                onClick={() => setVoiceError(null)}
                className="shrink-0 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-sm font-medium text-olive hover:text-sage rounded-xl hover:bg-sage/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-manipulation"
                aria-label="Dismiss"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Input bar — Mediterranean tokens, safe area, send feedback */}
          <form
            onSubmit={handleSubmit}
            className="shrink-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-sand-200 flex gap-2 items-end bg-background"
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
                className="w-full min-h-[44px] max-h-32 resize-none rounded-xl border border-sand-200 bg-sand-100/50 px-4 py-3 pr-14 text-base text-olive placeholder:text-olive-muted focus:outline-none focus:ring-2 focus:ring-sage/50 focus:border-sage disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation transition-colors"
              />
              <button
                type="button"
                onClick={listening ? stopListening : startListening}
                className={`absolute right-2 bottom-2 flex items-center justify-center rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background min-h-[44px] min-w-[44px] touch-manipulation ${
                  listening
                    ? "bg-sage/20 text-sage hover:bg-sage/30 active:scale-[0.97]"
                    : "bg-sand-200 text-olive hover:bg-sage/10 hover:text-sage active:scale-[0.97]"
                }`}
                aria-label={listening ? "Stop listening" : "Tap to speak"}
              >
                <MicIcon listening={listening} />
              </button>
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="shrink-0 min-h-[44px] px-5 py-2.5 rounded-xl bg-sage text-white font-medium text-sm hover:bg-sage/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-manipulation"
              aria-label="Send message"
            >
              Send
            </button>
          </form>
        </div>
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
      <span className="[&_a]:text-sage [&_a]:underline [&_a]:break-all [&_p]:mb-1 last:[&_p]:mb-0">
        <ReactMarkdown
          components={{
            a: ({ href, children }) => {
              const url = href ?? "#";
              const safe = isSafeUrl(url);
              const placeMatch = url.match(/^\/(trails|discover)\/([^/?#]+)/);
              const place = placeMatch ? getPlaceById(placeMatch[2]) : undefined;
              return (
                <span className="inline-flex flex-wrap items-center gap-1.5">
                  <a
                    href={safe ? url : "#"}
                    rel={url.startsWith("http") ? "noopener noreferrer" : undefined}
                    target={url.startsWith("http") ? "_blank" : undefined}
                    className="text-sage underline underline-offset-2 hover:text-sage/90 break-all transition-colors"
                  >
                    {children}
                  </a>
                  {place && (
                    <AddToItineraryButton placeId={place.id} label="Add" className="!py-1.5 !px-2 text-xs" />
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
              className="min-h-[44px] inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-sage hover:bg-sage/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-1"
            >
              Browse Discover
            </Link>
            <Link
              href="/trails"
              className="min-h-[44px] inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-sage hover:bg-sage/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-1"
            >
              View trails
            </Link>
          </span>
        )}
        {isRetryable && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="min-h-[44px] inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-sage hover:bg-sage/10 active:scale-[0.98] transition-all touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-1"
          >
            Retry
          </button>
        )}
        <button
          type="button"
          onClick={() => (speaking ? onStopSpeak() : onSpeak(plainText))}
          className="min-h-[44px] inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-olive/80 hover:text-sage hover:bg-sage/5 active:scale-[0.98] transition-all touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-1"
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
