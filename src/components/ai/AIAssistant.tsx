"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { AIChatMessages } from "./AIChatMessages";
import { AIChatInput } from "./AIChatInput";
import { useAIChat } from "./hooks/useAIChat";
import { LAYER, LAYOUT, TYPE } from "@/lib/design-tokens";

const OPEN_AI_EVENT = "open-ai-assistant";

function blockingOverlayActive(): boolean {
  if (typeof document === "undefined") return false;
  return !!document.querySelector(
    '[data-overlay-priority="blocking"][data-overlay-active="true"]'
  );
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const previousBodyOverflowRef = useRef("");
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const tCommon = useTranslations("common");
  const {
    messages,
    input,
    setInput,
    loading,
    suggestions,
    sendMessage,
    clearChat,
  } = useAIChat();

  const handleClose = useCallback(() => {
    setIsOpen(false);
    previouslyFocusedRef.current?.focus?.();
  }, []);

  useEffect(() => {
    const handleOpen = () => {
      if (blockingOverlayActive()) return;
      setIsOpen(true);
    };
    if (typeof window !== "undefined") {
      window.addEventListener(OPEN_AI_EVENT, handleOpen);
      return () => window.removeEventListener(OPEN_AI_EVENT, handleOpen);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    previousBodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflowRef.current;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    previouslyFocusedRef.current = (document.activeElement as HTMLElement | null) ?? null;
    const raf = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const first = panel.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      (first ?? panel).focus?.();
    });
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, handleClose]);

  const handleSend = useCallback(() => {
    sendMessage(input);
  }, [input, sendMessage]);

  const handleRetry = useCallback(() => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 ${LAYER.modal} flex items-end sm:items-center justify-center bg-charcoal/60 backdrop-blur-sm`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-chat-title"
    >
      <div
        ref={panelRef}
        className={`w-full sm:w-[90%] sm:max-w-2xl h-[85vh] sm:h-[80vh] bg-white rounded-t-2xl sm:rounded-2xl 
                    shadow-2xl flex flex-col overflow-hidden ai-chat-panel-enter ${LAYOUT.safeAreaX}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-sand-200">
          <div>
            <h2 id="ai-chat-title" className={`${TYPE.cardTitle}`}>
              {tCommon("ai.title")}
            </h2>
            <p className="text-xs text-sage">{tCommon("ai.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearChat}
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-3 text-xs text-olive/70 hover:text-terracotta rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
            >
              {tCommon("ai.clear")}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] p-2 text-olive hover:bg-sand-100 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
              aria-label={tCommon("ai.closeAria")}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <AIChatMessages
          messages={messages}
          loading={loading}
          onRetry={handleRetry}
        />

        {/* Input */}
        <AIChatInput
          input={input}
          setInput={setInput}
          onSend={handleSend}
          loading={loading}
          suggestions={suggestions}
        />
      </div>
    </div>
  );
}
