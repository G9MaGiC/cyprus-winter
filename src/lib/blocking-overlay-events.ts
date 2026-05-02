/**
 * Notify listeners that a blocking overlay (cookie, onboarding, etc.) may have changed.
 * Used to refresh AI trigger state without scanning the whole DOM on every mutation.
 */
export const BLOCKING_OVERLAY_DIRTY_EVENT = "cyprus-blocking-overlay-dirty";

export function dispatchBlockingOverlayDirty(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(BLOCKING_OVERLAY_DIRTY_EVENT));
}
