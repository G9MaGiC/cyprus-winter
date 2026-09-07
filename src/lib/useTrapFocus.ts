/**
 * Trap focus within a modal container and handle Escape.
 */
import { useCallback } from "react";

/**
 * The one focusable-element selector every trap shares (hook and the
 * hand-rolled menu/panel traps in Nav, BottomNav, AIAssistant). Excludes
 * disabled controls — trapping Tab onto a disabled button strands the
 * cycle — and includes inputs and positive-tabindex elements, which the
 * menus' old `a[href], button` selector silently skipped.
 */
export const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useTrapFocus() {
  return useCallback((e: React.KeyboardEvent, container: HTMLElement | null, onEscape?: () => void) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onEscape?.();
      return;
    }
    if (e.key !== "Tab" || !container) return;
    const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
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
