"use client";

import type { ReactNode } from "react";
import { useItinerary } from "@/hooks/useItinerary";

type HomeDiscoverySectionsProps = {
  children: ReactNode;
};

/**
 * Hides editor picks and book tastings when the visitor already has plan items.
 * Server-rendered sections are passed as children to preserve RSC boundaries.
 */
export default function HomeDiscoverySections({ children }: HomeDiscoverySectionsProps) {
  const { hasContent, hydrated } = useItinerary();

  if (hydrated && hasContent) {
    return null;
  }

  return <>{children}</>;
}
