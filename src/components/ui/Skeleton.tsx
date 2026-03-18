"use client";

/**
 * Skeleton loading components for better perceived performance
 * Uses animate-pulse with Mediterranean color palette
 */

import { cn } from "@/lib/utils";
import { SKELETON } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        SKELETON.block,
        className
      )}
    />
  );
}

export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn(SKELETON.card, "p-5", className)}>
      <Skeleton className="h-40 w-full mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function TextSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export function BookingCardSkeleton() {
  return (
    <div className={cn(SKELETON.card, "p-5")}>
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  const tCommon = useTranslations("common");
  return (
    <div
      className="space-y-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={tCommon("loading.content")}
    >
      <span className="sr-only">{tCommon("loading.ellipsis")}</span>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full" />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative min-h-[72vh] flex flex-col items-center justify-end pb-16">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="relative z-10 w-full max-w-lg mx-auto text-center space-y-4 px-6">
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-16 w-full max-w-md mx-auto" />
        <Skeleton className="h-6 w-3/4 mx-auto" />
        <Skeleton className="h-12 w-48 mx-auto mt-8" />
      </div>
    </div>
  );
}

export function SearchResultSkeleton() {
  return (
    <div className="px-4 py-3 min-h-[44px]">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-4 w-24 mt-1" />
    </div>
  );
}
