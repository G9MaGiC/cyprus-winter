"use client";

/**
 * Error state components for better UX during failures
 * Includes retry functionality and helpful messaging
 */

import AppLink from "@/components/AppLink";
import { useState, useEffect, useSyncExternalStore } from "react";
import { CARD, CTA, SECTION, TYPE } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

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
  return <div className={cn("h-1.5 w-16 mx-auto rounded-full", SECTION.titleGap, color)} aria-hidden />;
}

export function ErrorState({
  title,
  message,
  retry,
  retryLabel,
  showHomeLink = true,
  className,
  icon = "error",
}: ErrorStateProps) {
  const tErrors = useTranslations("errors");
  const tCommon = useTranslations("common");
  const resolvedTitle = title ?? tErrors("common.title");
  const resolvedRetryLabel = retryLabel ?? tCommon("tryAgain");

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
      <h3 className={`${TYPE.cardTitle} text-charcoal ${SECTION.titleGap}`}>
        {resolvedTitle}
      </h3>
      <p className={`text-sm text-olive/80 ${SECTION.headingGap} max-w-md mx-auto break-words`}>
        {message}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        {retry && (
          <button
            type="button"
            onClick={retry}
            className={`${CTA.primaryCompact} min-h-[44px]`}
          >
            {resolvedRetryLabel}
          </button>
        )}
        {showHomeLink && (
          <AppLink
            href="/"
            className={`${CTA.secondaryCompact} min-h-[44px]`}
          >
            {tCommon("goHome")}
          </AppLink>
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
  const tErrors = useTranslations("errors");

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const canRetry = countdown <= 0;

  return (
    <ErrorState
      title={tErrors("rateLimited.title")}
      message={
        canRetry
          ? tErrors("rateLimited.canRetry")
          : tErrors("rateLimited.waitThenRetry", { seconds: countdown })
      }
      retry={canRetry ? onRetry : undefined}
      retryLabel={
        canRetry
          ? tErrors("rateLimited.retryNow")
          : tErrors("rateLimited.retryIn", { seconds: countdown })
      }
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
  const tErrors = useTranslations("errors");
  const tCommon = useTranslations("common");
  const isOnline = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getServerSnapshot
  );

  return (
    <ErrorState
      title={isOnline ? tErrors("network.titleOnline") : tErrors("network.titleOffline")}
      message={
        isOnline
          ? tErrors("network.messageOnline")
          : tErrors("network.messageOffline")
      }
      retry={onRetry}
      retryLabel={isOnline ? tCommon("tryAgain") : tErrors("network.checkConnection")}
      icon="network"
      className={className}
    />
  );
}
