"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import type { ToastOptions } from "@/components/ui/Toast";

type ToastContextValue = {
  toasts: ReturnType<typeof useToast>["toasts"];
  removeToast: (id: string) => void;
  success: (message: string, options?: ToastOptions | number) => string;
  error: (message: string, options?: ToastOptions | number) => string;
  warning: (message: string, options?: ToastOptions | number) => string;
  info: (message: string, options?: ToastOptions | number) => string;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </ToastContext.Provider>
  );
}

const noop = () => "";

/** Returns toast helpers. Gracefully degrades (no-ops) outside ToastProvider. */
export function useToastContext(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toasts: [],
      removeToast: () => {},
      success: noop,
      error: noop,
      warning: noop,
      info: noop,
    };
  }
  return ctx;
}
