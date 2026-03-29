"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { AIChatMessages } from "./AIChatMessages";
import { AIChatInput } from "./AIChatInput";
import { useAIChat } from "./hooks/useAIChat";
import { LAYOUT, TYPE } from "@/lib/design-tokens";

const OPEN_AI_EVENT = "open-ai-assistant";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
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

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    if (typeof window !== "undefined") {
      window.addEventListener(OPEN_AI_EVENT, handleOpen);
      return () => window.removeEventListener(OPEN_AI_EVENT, handleOpen);
    }
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-charcoal/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-chat-title"
    >
      <div
        className={`w-full sm:w-[90%] sm:max-w-2xl h-[88vh] sm:h-[82vh] bg-white rounded-t-3xl sm:rounded-3xl
                    shadow-[0_32px_80px_rgba(37,39,48,0.25),0_0_0_1px_rgba(37,39,48,0.04)] flex flex-col overflow-hidden ai-chat-panel-enter ${LAYOUT.safeAreaX}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-sand-200/70">
          <div>
            <h2 id="ai-chat-title" className={`${TYPE.cardTitle} tracking-[-0.01em]`}>
              {tCommon("ai.title")}
            </h2>
            <p className="text-xs text-sage mt-0.5">{tCommon("ai.subtitle")}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              className="text-xs text-olive/70 hover:text-terracotta px-3 py-1.5 rounded-lg hover:bg-sand-100 transition-colors"
            >
              {tCommon("ai.clear")}
            </button>
            <button
              onClick={handleClose}
              className="p-2.5 text-olive hover:bg-sand-100 rounded-xl transition-colors"
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
