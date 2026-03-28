"use client";

import { useRef, useState, useCallback } from "react";
import { Send, Mic, MicOff } from "lucide-react";
import { useTranslations } from "next-intl";

interface AIChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  loading: boolean;
  suggestions: string[];
}

export function AIChatInput({
  input,
  setInput,
  onSend,
  loading,
  suggestions,
}: AIChatInputProps) {
  const tCommon = useTranslations("common");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  const initSpeechRecognition = useCallback(() => {
    if (typeof window === "undefined") return null;

    const SpeechRecognitionAPI =
      (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setSpeechSupported(false);
      return null;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join("");
      setInput(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  }, [setInput]);

  const toggleListening = useCallback(() => {
    if (!speechSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current = initSpeechRecognition();
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  }, [isListening, speechSupported, initSpeechRecognition]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSend();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="border-t border-sand-200 bg-white">
      {/* Suggestions */}
      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="shrink-0 px-3 py-1.5 text-xs sm:text-sm bg-sand-100 hover:bg-terracotta/10 
                         text-olive hover:text-terracotta rounded-full transition-colors
                         border border-sand-200/80 whitespace-nowrap"
              disabled={loading}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="px-4 pb-4">
        <div className="flex items-center gap-2 bg-sand-100 rounded-full px-4 py-2">
          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`shrink-0 p-2 rounded-full transition-colors ${
                isListening
                  ? "bg-terracotta text-white animate-pulse"
                  : "text-olive hover:bg-sand-200"
              }`}
              aria-label={isListening ? tCommon("ai.stopVoice") : tCommon("ai.startVoice")}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={tCommon("ai.inputPlaceholder")}
            className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-olive placeholder:text-olive/50"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="shrink-0 p-2 bg-terracotta text-white rounded-full hover:bg-terracotta-muted 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={tCommon("ai.sendAria")}
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
