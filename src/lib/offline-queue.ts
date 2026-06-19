/**
 * Offline mutation queue.
 * Queues failed API mutations when offline; retries when connection restored.
 * Persists to localStorage so queue survives page refresh.
 * SYSTEM_DESIGN_REVIEW.md §5.4
 */

const STORAGE_KEY = "cyprus-winter-offline-queue";
const MAX_ITEMS = 50;
let processingPromise: Promise<{ processed: number; succeeded: number }> | null = null;

export type QueuedMutation = {
  id: string;
  type: string;
  url: string;
  method: string;
  body?: string;
  createdAt: number;
};

function load(): QueuedMutation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
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

/** Add a mutation to the queue. Call when a fetch fails due to network/offline. */
export function addMutation(mutation: Omit<QueuedMutation, "id" | "createdAt">): void {
  const items = load();
  const item: QueuedMutation = {
    ...mutation,
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

async function drainQueue(): Promise<{ processed: number; succeeded: number }> {
  const items = load();
  if (items.length === 0) return { processed: 0, succeeded: 0 };

  let succeeded = 0;
  for (const item of items) {
    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: { "Content-Type": "application/json" },
        body: item.body ?? undefined,
      });

      if (res.ok) {
        removeMutation(item.id);
        succeeded++;
      }
      // Non-2xx: leave in queue, will retry next online
    } catch {
      // Network error: leave in queue
    }
  }
  return { processed: items.length, succeeded };
}

/** Process the queue: retry each mutation, remove on success. */
export async function processQueue(): Promise<{ processed: number; succeeded: number }> {
  if (processingPromise) return processingPromise;

  processingPromise = drainQueue().finally(() => {
    processingPromise = null;
  });
  return processingPromise;
}
