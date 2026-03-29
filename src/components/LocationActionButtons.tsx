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
    <div className={`flex flex-wrap gap-2.5 ${className}`} data-right-now-actions>
      <button
        type="button"
        onClick={handlePrimary}
        data-testid="right-now-primary"
        className="px-4 py-2 rounded-xl bg-terracotta text-white text-sm font-medium tracking-[0.005em] hover:bg-terracotta-muted transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 shadow-[0_1px_4px_rgba(201,111,82,0.3)]"
      >
        {primaryLabel}
      </button>
      {onSecondary && (
        <button
          type="button"
          onClick={handleSecondary}
          data-testid="right-now-pick-region"
          className="inline-flex items-center min-h-[44px] px-4 py-2 rounded-xl text-olive/70 text-sm hover:text-olive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-2"
        >
          {secondaryLabel}
        </button>
      )}
    </div>
  );
}
