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
    const handleOnline = () => {
      if (processedRef.current) return;
      processedRef.current = true;
      processQueue().finally(() => {
        processedRef.current = false;
      });
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return null;
}
