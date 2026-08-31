/**
 * Offline mutation queue.
 * Queues failed API mutations when offline; retries when connection restored.
 * Persists to localStorage so queue survives page refresh.
 */

const STORAGE_KEY = "cyprus-winter-offline-queue";
/** Fired on window after a drain delivers at least one queued mutation. */
export const OFFLINE_QUEUE_DRAINED_EVENT = "cyprus-winter:offline-queue-drained";
/** Fired on window after a drain permanently discards at least one mutation
    (non-retryable 4xx). Mounted forms use it to replace the stale "will be
    sent when back online" promise with a visible failure (AUD-21). */
export const OFFLINE_QUEUE_DROPPED_EVENT = "cyprus-winter:offline-queue-dropped";
const MAX_ITEMS = 50;
const ALLOWED_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const RETRYABLE_CLIENT_STATUSES = new Set([408, 425, 429]);

export type QueuedMutation = {
  id: string;
  type: string;
  url: string;
  method: string;
  body?: string;
  createdAt: number;
};

type ProcessQueueResult = { processed: number; succeeded: number };

let inFlightProcess: Promise<ProcessQueueResult> | null = null;

function isValidQueuedMutation(value: unknown): value is QueuedMutation {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<QueuedMutation>;
  return (
    typeof item.id === "string" &&
    typeof item.type === "string" &&
    typeof item.url === "string" &&
    item.url.startsWith("/api/") &&
    !item.url.startsWith("//") &&
    typeof item.method === "string" &&
    ALLOWED_METHODS.has(item.method.toUpperCase()) &&
    (item.body == null || typeof item.body === "string") &&
    typeof item.createdAt === "number"
  );
}

function load(): QueuedMutation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isValidQueuedMutation) : [];
  } catch {
    return [];
  }
}

function save(items: QueuedMutation[]) {
  if (typeof window === "undefined") return;
  try {
    const trimmed = items.slice(-MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full or unavailable
  }
}

/** Add a same-origin API mutation to the queue. */
export function addMutation(mutation: Omit<QueuedMutation, "id" | "createdAt">): void {
  const normalizedMethod = mutation.method.toUpperCase();
  if (
    !mutation.url.startsWith("/api/") ||
    mutation.url.startsWith("//") ||
    !ALLOWED_METHODS.has(normalizedMethod)
  ) {
    return;
  }

  const items = load();
  const item: QueuedMutation = {
    ...mutation,
    method: normalizedMethod,
    id: `mq-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: Date.now(),
  };
  items.push(item);
  save(items);
}

/** Get current queue (for UI/debugging). */
export function getQueue(): QueuedMutation[] {
  return load();
}

/** Remove a mutation from the queue (e.g. after successful retry). */
export function removeMutation(id: string): void {
  const items = load().filter((m) => m.id !== id);
  save(items);
}

async function processQueueOnce(): Promise<ProcessQueueResult> {
  const items = load();
  if (items.length === 0) return { processed: 0, succeeded: 0 };

  let succeeded = 0;
  let dropped = 0;
  for (const item of items) {
    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: { "Content-Type": "application/json" },
        body: item.body ?? undefined,
      });

      if (res.ok) {
        // Persist the created booking locally: without this, a drained booking
        // is invisible on this device (/bookings reads localStorage) and the
        // form's stale offline message becomes actively false (AUD B2-06).
        if (item.type === "winery_booking" || item.type === "guide_booking") {
          try {
            const data = await res.json();
            if (data?.booking) {
              const { addBookingToLocal } = await import("@/lib/bookings-storage");
              addBookingToLocal(data.booking);
            }
          } catch {
            // Response parse failure — the booking still exists server-side;
            // the email lookup remains the recovery path.
          }
        }
        removeMutation(item.id);
        succeeded++;
      } else if (res.status >= 400 && res.status < 500 && !RETRYABLE_CLIENT_STATUSES.has(res.status)) {
        // Validation/auth/not-found errors are permanent for this queued payload.
        // Retrying them forever would hide the failure and waste requests.
        removeMutation(item.id);
        dropped++;
      }
    } catch {
      // Network error: leave in queue for the next online event.
    }
  }
  const canDispatch =
    typeof window !== "undefined" && typeof window.dispatchEvent === "function";
  if (succeeded > 0 && canDispatch) {
    // Let mounted forms replace their stale "will be sent when back online"
    // message with the delivered state (AUD B2-06 residual).
    window.dispatchEvent(
      new CustomEvent(OFFLINE_QUEUE_DRAINED_EVENT, { detail: { succeeded } })
    );
  }
  if (dropped > 0 && canDispatch) {
    window.dispatchEvent(
      new CustomEvent(OFFLINE_QUEUE_DROPPED_EVENT, { detail: { dropped } })
    );
  }
  return { processed: items.length, succeeded };
}

/** Process the queue: retry each mutation, serializing concurrent callers. */
export function processQueue(): Promise<ProcessQueueResult> {
  if (inFlightProcess) return inFlightProcess;

  inFlightProcess = processQueueOnce().finally(() => {
    inFlightProcess = null;
  });
  return inFlightProcess;
}
