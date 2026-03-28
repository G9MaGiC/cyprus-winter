/**
 * Safe localStorage wrapper with in-memory fallback.
 * Handles private browsing (Safari/Firefox quota=0), storage full,
 * and SSR environments gracefully.
 */

const memoryStore = new Map<string, string>();

/** True if localStorage is available and writable. */
let storageAvailable: boolean | null = null;

function isLocalStorageAvailable(): boolean {
  if (storageAvailable !== null) return storageAvailable;
  if (typeof window === "undefined") {
    storageAvailable = false;
    return false;
  }
  try {
    const key = "__cw_storage_test__";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  return storageAvailable;
}

export function safeGetItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  if (isLocalStorageAvailable()) {
    try {
      return localStorage.getItem(key);
    } catch {
      // Fall through to memory store
    }
  }
  return memoryStore.get(key) ?? null;
}

export function safeSetItem(key: string, value: string): void {
  if (typeof window === "undefined") return;
  if (isLocalStorageAvailable()) {
    try {
      localStorage.setItem(key, value);
      return;
    } catch {
      // Storage full or unavailable — fall through to memory store
    }
  }
  memoryStore.set(key, value);
}

export function safeRemoveItem(key: string): void {
  if (typeof window === "undefined") return;
  memoryStore.delete(key);
  if (isLocalStorageAvailable()) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}
