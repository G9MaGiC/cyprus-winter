"use client";

import { useEffect, useRef } from "react";
import { processQueue } from "@/lib/offline-queue";

/**
 * Listens for online event and processes the offline mutation queue.
 * Also flushes once on mount so a refresh while already online still drains the queue.
 * Mount once at app root (e.g. in Providers). Nested Providers share processQueue's lock.
 */
export default function OfflineQueueProcessor() {
  const processedRef = useRef(false);

  useEffect(() => {
    const run = () => {
      if (processedRef.current) return;
      processedRef.current = true;
      processQueue().finally(() => {
        processedRef.current = false;
      });
    };

    run();
    window.addEventListener("online", run);
    return () => window.removeEventListener("online", run);
  }, []);

  return null;
}
