import { useSyncExternalStore } from "react";

/**
 * Subscribes to `window.matchMedia(query)`. Server snapshot avoids hydration mismatch.
 */
export function useMatchMedia(query: string, serverFallback = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverFallback
  );
}
