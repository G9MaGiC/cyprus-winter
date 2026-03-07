"use client";

/**
 * Client component to track page views
 * Used in server components to track recently viewed items
 */

import { useEffect } from "react";
import { addToRecentlyViewed } from "@/lib/recently-viewed";

interface TrackViewProps {
  id: string;
  name: string;
  type: "winery" | "restaurant" | "attraction" | "trail" | "event" | string;
  region: string;
}

export default function TrackView({ id, name, type, region }: TrackViewProps) {
  useEffect(() => {
    // Debounce to avoid tracking rapid navigation
    const timer = setTimeout(() => {
      addToRecentlyViewed({ id, name, type, region });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [id, name, type, region]);

  return null;
}
