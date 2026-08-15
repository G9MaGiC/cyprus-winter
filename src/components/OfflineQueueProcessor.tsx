"use client";

import { useEffect, useRef } from "react";
import { processQueue } from "@/lib/offline-queue";

/**
 * Listens for online event and processes the offline mutation queue.
 * Mount once at app root (e.g. in Providers).
 */
export default function OfflineQueueProcessor() {
  const processedRef = useRef(false);

  useEffect(() => {
    const flush = () => {
      if (processedRef.current) return;
      processedRef.current = true;
      processQueue().finally(() => {
        processedRef.current = false;
      });
    };

    flush();
    window.addEventListener("online", flush);
    return () => window.removeEventListener("online", flush);
  }, []);

  return null;
}
