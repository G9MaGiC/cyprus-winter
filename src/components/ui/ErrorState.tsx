"use client";

/**
 * Error state components for better UX during failures
 * Includes retry functionality and helpful messaging
 */

import Link from "next/link";
import { useState, useEffect, useSyncExternalStore } from "react";
import { CARD, CTA } from "@/lib/design-tokens";
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

export function ErrorState({
  title = "Something went wrong",
  message,
  retry,
  retryLabel = "Try again",
  showHomeLink = true,
  className,
  icon = "error",
}: ErrorStateProps) {
  const icons = {
    error: "⚠️",
    warning: "⚡",
    "rate-limit": "⏱️",
    network: "📡",
  };

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
      <div className="text-4xl mb-3" aria-hidden>
        {icons[icon]}
      </div>
      <h3 className="font-display text-lg font-semibold text-olive mb-2">
        {title}
      </h3>
      <p className="text-sm text-olive/70 mb-4 max-w-md mx-auto break-words">
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
          : `Please wait ${countdown} second${countdown === 1 ? "" : "s"} before trying again. This helps us keep the service running smoothly for everyone.`
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
          ? "We're having trouble connecting. Check your connection and try again."
          : "Connect to the internet to browse trails, wineries, and plan your trip. Your saved bookings are still available."
      }
      retry={onRetry}
      retryLabel={isOnline ? "Try again" : "Check connection"}
      icon="network"
      className={className}
    />
  );
}
