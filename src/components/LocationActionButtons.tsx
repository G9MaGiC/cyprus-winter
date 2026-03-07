"use client";

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
        className="px-3 py-1.5 rounded-md bg-terracotta text-white text-sm font-medium hover:bg-terracotta-muted transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
      >
        {primaryLabel}
      </button>
      {onSecondary && (
        <button
          type="button"
          onClick={handleSecondary}
          data-testid="right-now-pick-region"
          className="inline-flex items-center min-h-[44px] px-3 py-2 rounded-md text-olive/70 text-sm hover:text-olive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-2"
        >
          {secondaryLabel}
        </button>
      )}
    </div>
  );
}
