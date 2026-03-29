"use client";

/**
 * Toast notification system for user feedback
 * Non-blocking, auto-dismissible notifications
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const icons: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

const styles: Record<ToastType, string> = {
  success: "bg-aegean text-white border-aegean/30",
  error: "bg-terracotta text-white border-terracotta/30",
  warning: "bg-golden text-white border-golden/30",
  info: "bg-olive text-white border-olive/30",
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const tCommon = useTranslations("common");
  const [isExiting, setIsExiting] = useState(false);
  const innerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const outerTimer = setTimeout(() => {
      setIsExiting(true);
      innerTimerRef.current = setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 5000);

    return () => {
      clearTimeout(outerTimer);
      if (innerTimerRef.current) {
        clearTimeout(innerTimerRef.current);
        innerTimerRef.current = null;
      }
    };
  }, [toast, onRemove]);

  const scheduleRemove = useCallback(() => {
    if (innerTimerRef.current) {
      clearTimeout(innerTimerRef.current);
      innerTimerRef.current = null;
    }
    innerTimerRef.current = setTimeout(() => onRemove(toast.id), 300);
  }, [toast.id, onRemove]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "flex items-center gap-3 px-5 py-4 rounded-2xl border",
        "min-h-[52px] min-w-[280px] max-w-md",
        "shadow-[0_8px_32px_rgba(37,39,48,0.18),0_0_0_1px_rgba(255,255,255,0.08)]",
        "transform transition-all duration-300",
        isExiting ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0",
        styles[toast.type]
      )}
    >
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20 text-sm font-bold shrink-0">
        {icons[toast.type]}
      </span>
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        type="button"
        onClick={() => {
          setIsExiting(true);
          scheduleRemove();
        }}
        className="shrink-0 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl hover:bg-white/20 transition-colors"
        aria-label={tCommon("aria.dismissNotification")}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }: ToastProps) {
  const tCommon = useTranslations("common");
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed right-4 sm:right-5 top-4 sm:top-5 z-[100] flex flex-col gap-3 items-end"
      role="region"
      aria-label={tCommon("aria.notifications")}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

// Hook for using toasts
let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info", duration?: number) => {
    const id = `toast-${++toastId}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (message: string, duration?: number) => addToast(message, "success", duration),
    [addToast]
  );
  const error = useCallback(
    (message: string, duration?: number) => addToast(message, "error", duration),
    [addToast]
  );
  const warning = useCallback(
    (message: string, duration?: number) => addToast(message, "warning", duration),
    [addToast]
  );
  const info = useCallback(
    (message: string, duration?: number) => addToast(message, "info", duration),
    [addToast]
  );

  return {
    toasts,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
