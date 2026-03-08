"use client";

/**
 * Error state components for better UX during failures
 * Includes retry functionality and helpful messaging
 */

import Link from "next/link";
import { useState, useEffect, useSyncExternalStore } from "react";
import { CARD, CTA, SECTION } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message: string;
  retry?: () => void;
  retryLabel?: string;
  showHomeLink?: boolean;
  className?: string;
  icon?: "error" | "warning" | "rate-limit" | "network";
}

/** Minimal accent bar per icon type — no emojis (UX persona) */
function IconAccent({ type }: { type: ErrorStateProps["icon"] }) {
  const color = type === "rate-limit" ? "bg-golden/60" : type === "network" ? "bg-aegean/60" : "bg-terracotta/60";
  return <div className={cn("h-1 w-12 mx-auto rounded-full", SECTION.titleGap, color)} aria-hidden />;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  retry,
  retryLabel = "Try again",
  showHomeLink = true,
  className,
  icon = "error",
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        CARD.base,
        CARD.content,
        "text-center bg-terracotta/5 border-terracotta/20",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <IconAccent type={icon} />
      <h3 className="font-display text-lg font-semibold text-charcoal mb-2">
        {title}
      </h3>
      <p className={`text-sm text-olive/80 ${SECTION.headingGap} max-w-md mx-auto break-words`}>
        {message}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {retry && (
          <button
            type="button"
            onClick={retry}
            className={`${CTA.primaryCompact} min-h-[44px]`}
          >
            {retryLabel}
          </button>
        )}
        {showHomeLink && (
          <Link
            href="/"
            className={`${CTA.secondaryCompact} min-h-[44px]`}
          >
            Go home
          </Link>
        )}
      </div>
    </div>
  );
}

interface RateLimitErrorProps {
  retryAfter?: number;
  onRetry?: () => void;
  className?: string;
}

export function RateLimitError({
  retryAfter,
  onRetry,
  className,
}: RateLimitErrorProps) {
  const initialCount = retryAfter || 60;
  const [countdown, setCountdown] = useState(initialCount);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const canRetry = countdown <= 0;

  return (
    <ErrorState
      title="Too many requests"
      message={
        canRetry
          ? "You can try again now."
          : `Wait ${countdown} second${countdown === 1 ? "" : "s"}, then try again.`
      }
      retry={canRetry ? onRetry : undefined}
      retryLabel={canRetry ? "Try again" : `Wait ${countdown}s`}
      icon="rate-limit"
      className={className}
    />
  );
}

// Subscribe to online/offline status
function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true; // Assume online on server
}

interface NetworkErrorProps {
  onRetry?: () => void;
  className?: string;
}

export function NetworkError({ onRetry, className }: NetworkErrorProps) {
  const isOnline = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getServerSnapshot
  );

  return (
    <ErrorState
      title={isOnline ? "Connection issue" : "You're offline"}
      message={
        isOnline
          ? "Connection trouble. Try again, or tap Ask AI."
          : "You're offline. Connect to browse trails and plan your trip."
      }
      retry={onRetry}
      retryLabel={isOnline ? "Try again" : "Check connection"}
      icon="network"
      className={className}
    />
  );
}
