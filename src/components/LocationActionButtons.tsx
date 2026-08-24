"use client";

import { LOCATION } from "@/lib/design-tokens";

type LocationActionButtonsProps = {
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  className?: string;
};

export default function LocationActionButtons({
  primaryLabel,
  onPrimary,
  secondaryLabel = "Pick a region",
  onSecondary,
  className = "",
}: LocationActionButtonsProps) {
  const handlePrimary = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPrimary();
  };
  const handleSecondary = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSecondary?.();
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`} data-right-now-actions>
      <button
        type="button"
        onClick={handlePrimary}
        data-testid="right-now-primary"
        className={LOCATION.primary}
      >
        {primaryLabel}
      </button>
      {onSecondary && (
        <button
          type="button"
          onClick={handleSecondary}
          data-testid="right-now-pick-region"
          className={LOCATION.secondary}
        >
          {secondaryLabel}
        </button>
      )}
    </div>
  );
}
