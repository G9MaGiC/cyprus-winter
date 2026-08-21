import AppLink from "@/components/AppLink";
import { PILL } from "@/lib/design-tokens";

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
  ariaLabel: string;
};

const baseClass = PILL.base;
const inactiveClass = PILL.neutral;
const defaultActiveClass = PILL.active;

export default function FilterChips({
  chips,
  isActive,
  getHref,
  activeClassName = defaultActiveClass,
  ariaLabel,
}: FilterChipsProps) {
  return (
    <div
      className="flex gap-2.5 overflow-x-auto overflow-y-hidden pb-1 -mb-1 pr-4 sm:pr-0 sm:flex-wrap sm:overflow-visible scrollbar-none scroll-smooth scroll-touch snap-x snap-mandatory sm:snap-none overscroll-x-contain touch-pan-x"
      role="group"
      aria-label={ariaLabel}
      style={{ WebkitOverflowScrolling: "touch", scrollPaddingInline: "max(1rem, env(safe-area-inset-left))" } as React.CSSProperties}
    >
      {chips.map((chip) => (
        <AppLink
          key={chip.id || "all"}
          href={getHref(chip)}
          aria-current={isActive(chip) ? "true" : undefined}
          className={`${baseClass} min-w-0 max-w-[min(100%,11rem)] sm:max-w-none snap-start ${isActive(chip) ? activeClassName : inactiveClass}`}
        >
          {chip.emoji && <span className="mr-0.5 shrink-0">{chip.emoji}</span>}
          <span className="truncate min-w-0">{chip.label}</span>
        </AppLink>
      ))}
    </div>
  );
}
