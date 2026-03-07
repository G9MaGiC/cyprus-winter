"use client";

/**
 * Contextual help tooltip system
 * Shows helpful tips based on user context
 */

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type HelpTip = {
  id: string;
  message: string;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
};

const helpTips: Record<string, HelpTip> = {
  "plan-empty": {
    id: "plan-empty",
    message: "Tap 'Add places' to start building your itinerary from Discover or Trails.",
    position: "bottom",
    delay: 500,
  },
  "plan-first-item": {
    id: "plan-first-item",
    message: "Great start! Add more places or switch days to plan your whole trip.",
    position: "bottom",
    delay: 0,
  },
  "discover-filter": {
    id: "discover-filter",
    message: "Use filters to find exactly what you're looking for—wineries, trails, beaches, and more.",
    position: "top",
    delay: 1000,
  },
  "booking-form": {
    id: "booking-form",
    message: "Fill in your details and the winery will confirm by email. Most respond within 24 hours.",
    position: "top",
    delay: 500,
  },
  "ai-assistant": {
    id: "ai-assistant",
    message: "Ask me anything—best trails, winery recommendations, or help planning your day.",
    position: "left",
    delay: 2000,
  },
};

interface ContextualHelpProps {
  context: keyof typeof helpTips;
  forceShow?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const STORAGE_KEY = "cyprus-dismissed-tips";

function getDismissedTips(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function dismissTip(id: string) {
  if (typeof window === "undefined") return;
  try {
    const dismissed = getDismissedTips();
    if (!dismissed.includes(id)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...dismissed, id]));
    }
  } catch {
    // ignore
  }
}

export default function ContextualHelp({
  context,
  forceShow = false,
  onDismiss,
  className,
}: ContextualHelpProps) {
  const tip = helpTips[context];
  const [isVisible, setIsVisible] = useState(false);
  const [canShow, setCanShow] = useState(false);
  const isClient = typeof window !== "undefined";

  // Check if tip was dismissed
  useEffect(() => {
    if (!isClient) return;
    const dismissed = getDismissedTips();
    if (!dismissed.includes(tip.id)) {
      setCanShow(true);
    }
  }, [tip.id, isClient]);

  // Handle delay and forceShow
  useEffect(() => {
    if (forceShow && canShow) {
      setIsVisible(true);
      return;
    }
    if (!canShow) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, tip.delay || 0);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canShow, forceShow]);

  const handleDismiss = () => {
    dismissTip(tip.id);
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isClient || !isVisible) return null;

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-sand-200",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-sand-200",
    left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-sand-200",
    right: "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-sand-200",
  };

  return (
    <div
      className={cn("absolute z-50", positionClasses[tip.position || "bottom"], className)}
      role="tooltip"
    >
      <div className="relative bg-white rounded-xl shadow-lg border border-sand-200 p-4 max-w-xs animate-in fade-in slide-in-from-bottom-2">
        {/* Arrow */}
        <div
          className={cn("absolute w-0 h-0 border-8", arrowClasses[tip.position || "bottom"])}
          aria-hidden
        />
        
        <p className="text-sm text-olive pr-6">{tip.message}</p>
        
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded hover:bg-sand-100 transition-colors"
          aria-label="Dismiss tip"
        >
          <svg className="w-4 h-4 text-olive/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
