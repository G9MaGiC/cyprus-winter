"use client";

import { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { isSafeUrl } from "@/lib/safe-url";
import { SECTION } from "@/lib/design-tokens";
import type { Message } from "./hooks/useAIChat";
import { ActionButtons } from "./ActionButtons";
import { PlaceCards } from "./PlaceCards";
import { FollowUpChips } from "./FollowUpChips";

interface AIChatMessagesProps {
  messages: Message[];
  loading: boolean;
  onRetry: () => void;
}

function ChatMessage({ message, onRetry }: { message: Message; onRetry: () => void }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-terracotta text-white rounded-br-md"
            : "bg-sand-100 text-olive rounded-bl-md"
        }`}
      >
        {isUser ? (
          <p className="text-sm sm:text-base">{message.content}</p>
        ) : (
          <div className="prose prose-sm prose-olive max-w-none">
            <ReactMarkdown
              components={{
                a: ({ href, children }) => {
                  if (!href || !isSafeUrl(href)) {
                    return <span className="text-olive/80">{children}</span>;
                  }
                  return (
                    <a
                      href={href}
                      className="text-aegean hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        {message.metadata?.cards && <PlaceCards cards={message.metadata.cards} />}
        {message.metadata?.actions && <ActionButtons actions={message.metadata.actions} />}
        {message.metadata?.followUps && (
          <FollowUpChips
            chips={message.metadata.followUps}
            onSelect={(chip) => {
              window.dispatchEvent(new CustomEvent("ai-followup", { detail: chip }));
            }}
          />
        )}
        {message.isRetryable && (
          <button
            type="button"
            onClick={onRetry}
            className={`mt-2 ${SECTION.aegeanLink} text-xs`}
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

export function AIChatMessages({ messages, loading, onRetry }: AIChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
      {messages.map((message, index) => (
        <ChatMessage
          key={index}
          message={message}
          onRetry={onRetry}
        />
      ))}
      {loading && (
        <div className="flex justify-start mb-4">
          <div className="bg-sand-100 rounded-2xl rounded-bl-md px-4 py-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-olive/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-olive/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-olive/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      )}
      <div ref={scrollRef} />
    </div>
  );
}
