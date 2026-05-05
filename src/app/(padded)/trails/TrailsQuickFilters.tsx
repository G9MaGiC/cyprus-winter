"use client";

import { Link } from "@/i18n/navigation";

const QUICK_CHIPS = [
  { id: "short-easy", label: "Short & easy", href: "/trails?difficulty=easy" },
  { id: "open", label: "Open today", href: "/trails?status=open" },
  { id: "winter", label: "Winter highlights", href: "/trails?region=Troodos" },
];

export default function TrailsQuickFilters() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="prose-label text-olive/60 mr-1">Quick:</span>
      {QUICK_CHIPS.map((chip) => (
        <Link
          key={chip.id}
          href={chip.href}
          className="px-3 py-2 rounded-lg text-sm font-medium border border-sand-200/80 text-olive/80 hover:border-terracotta/30 hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {chip.label}
        </Link>
      ))}
    </div>
  );
}
