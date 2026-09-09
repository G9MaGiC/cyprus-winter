/**
 * Trap focus within a modal container and handle Escape.
 */
import { useCallback, useEffect } from "react";

/**
 * The one focusable-element selector every trap shares (hook and the
 * hand-rolled menu/panel traps in Nav, BottomNav, AIAssistant). Excludes
 * disabled controls — trapping Tab onto a disabled button strands the
 * cycle — and includes inputs and positive-tabindex elements, which the
 * menus' old `a[href], button` selector silently skipped.
 */
export const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type FocusTrapOptions = {
  active: boolean;
  containerRef: React.RefObject<HTMLElement | null>;
  /**
   * Called on Escape. Focus restore stays with the caller: the close paths
   * are deliberately asymmetric (Nav restores on a rAF, BottomNav restores
   * synchronously on Escape but NOT on outside tap), and the hook must not
   * flatten that.
   */
  onEscape: () => void;
};

/**
 * Effect-based trap for open/close disclosures (the Nav menus, the BottomNav
 * sheet): on activation, focus the first focusable in the container; while
 * active, wrap Tab/Shift+Tab at the edges (focusables re-queried per keypress,
 * so content that mounts inside the open menu joins the cycle) and route
 * Escape to onEscape. The keydown listener sits on window — where the Nav
 * menus' original listener lived; real keydowns bubble there from any focused
 * element — so Escape still closes when focus has drifted out of the
 * container, and it exists ONLY
 * while active — an unconditional handler is exactly the BUG-359 regression
 * (Escape anywhere stole focus to the hamburger). Callers must pass a
 * useCallback-stable onEscape or the effect re-fires and re-grabs focus on
 * every render. Modals keep using useTrapFocus above (onKeyDown-prop model).
 */
export function useFocusTrap({ active, containerRef, onEscape }: FocusTrapOptions) {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;
    container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onEscape();
        return;
      }
      if (e.key !== "Tab" || !containerRef.current) return;
      const focusable = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, containerRef, onEscape]);
}

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
