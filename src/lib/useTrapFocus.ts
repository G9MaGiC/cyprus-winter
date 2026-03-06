/**
 * Trap focus within a modal container and handle Escape.
 */
import { useCallback } from "react";

export function useTrapFocus() {
  return useCallback((e: React.KeyboardEvent, container: HTMLElement | null, onEscape?: () => void) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onEscape?.();
      return;
    }
    if (e.key !== "Tab" || !container) return;
    const focusable = container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  }, []);
}
