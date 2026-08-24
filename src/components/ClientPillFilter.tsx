"use client";

import { PILL } from "@/lib/design-tokens";

type ClientPillFilterProps = {
  active: boolean;
  onClick: () => void;
  label: string;
};

/** Client-side filter pill — same visual contract as FilterChips / PILL tokens. */
export default function ClientPillFilter({ active, onClick, label }: ClientPillFilterProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`${PILL.base} ${active ? PILL.active : PILL.neutral}`}
    >
      {label}
    </button>
  );
}
