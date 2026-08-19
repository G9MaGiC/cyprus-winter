"use client";

import { useState, useEffect } from "react";
import ConversionTracker from "@/components/ConversionTracker";

export default function ConversionTrackerClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Intentionally using setState for client-only rendering
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <ConversionTracker />;
}
