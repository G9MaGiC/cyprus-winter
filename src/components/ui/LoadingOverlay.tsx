"use client";

/**
 * Loading overlay for full-page or section loading states
 * Prevents user interaction while maintaining accessibility
 */

import { cn } from "@/lib/utils";
import { LAYER } from "@/lib/design-tokens";

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  message?: string;
  blur?: boolean;
}

export function LoadingOverlay({
  isLoading,
  children,
  className,
  message = "Loading…",
  blur = true,
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div
          className={cn(
            `absolute inset-0 ${LAYER.chrome} flex flex-col items-center justify-center`,
            "bg-sand/80 transition-opacity duration-200",
            blur && "backdrop-blur-sm"
          )}
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="relative">
            {/* Animated spinner using Mediterranean colors */}
            <div className="w-12 h-12 rounded-full border-4 border-sand-300 border-t-terracotta animate-spin" />
          </div>
          {message && (
            <p className="mt-4 text-sm font-medium text-olive/80">{message}</p>
          )}
          <span className="sr-only">{message}</span>
        </div>
      )}
    </div>
  );
}

interface ButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export function ButtonLoading({
  isLoading,
  children,
  loadingText,
  className,
}: ButtonLoadingProps) {
  return (
    <span className={cn("flex items-center justify-center gap-2", className)}>
      {isLoading && (
        <span
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          aria-hidden
        />
      )}
      <span>{isLoading ? loadingText || children : children}</span>
    </span>
  );
}

interface ProgressBarProps {
  progress: number;
  className?: string;
  animated?: boolean;
}

export function ProgressBar({
  progress,
  className,
  animated = true,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      className={cn(
        "h-1.5 w-full bg-sand-200 rounded-full overflow-hidden",
        className
      )}
      role="progressbar"
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full bg-terracotta rounded-full",
          animated && "transition-all duration-300 ease-out"
        )}
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  );
}
