"use client";

export function FollowUpChips({
  chips,
  onSelect,
}: {
  chips: string[];
  onSelect: (chip: string) => void;
}) {
  if (!chips.length) return null;

  return (
    <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-hide">
      {chips.map((chip, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(chip)}
          className="shrink-0 px-3 py-1 text-xs rounded-full border border-olive/20 text-olive/80 hover:bg-sand-100 hover:border-olive/40 transition-colors whitespace-nowrap min-h-[32px]"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
