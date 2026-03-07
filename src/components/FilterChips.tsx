import Link from "next/link";

export type FilterChip = {
  id: string;
  label: string;
  emoji?: string;
};

type FilterChipsProps = {
  chips: FilterChip[];
  isActive: (chip: FilterChip) => boolean;
  getHref: (chip: FilterChip) => string;
  activeClassName?: string;
  /** Accessible label for the filter group */
  ariaLabel?: string;
};

const baseClass =
  "inline-flex items-center min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background shrink-0";
const inactiveClass = "bg-sand-200/80 text-olive/80 hover:bg-sand-200";
const defaultActiveClass = "bg-terracotta text-white border border-terracotta/30 shadow-sm hover:bg-terracotta-muted ring-2 ring-terracotta ring-offset-2 ring-offset-sand";

export default function FilterChips({
  chips,
  isActive,
  getHref,
  activeClassName = defaultActiveClass,
  ariaLabel = "Filters",
}: FilterChipsProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto overflow-y-hidden pb-1 -mb-1 sm:flex-wrap sm:overflow-visible scrollbar-none scroll-smooth snap-x snap-mandatory sm:snap-none"
      role="group"
      aria-label={ariaLabel}
      style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
    >
      {chips.map((chip) => (
        <Link
          key={chip.id || "all"}
          href={getHref(chip)}
          className={`${baseClass} min-w-0 snap-start ${isActive(chip) ? activeClassName : inactiveClass}`}
        >
          {chip.emoji && <span className="mr-0.5 shrink-0">{chip.emoji}</span>}
          <span className="truncate min-w-0">{chip.label}</span>
        </Link>
      ))}
    </div>
  );
}
