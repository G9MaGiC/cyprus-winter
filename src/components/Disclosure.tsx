"use client";

import { useState } from "react";
import { TYPE } from "@/lib/design-tokens";

export type DisclosureProps = {
  id?: string;
  summary: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
};

export default function Disclosure({
  id,
  summary,
  defaultOpen = false,
  children,
  className = "",
}: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <details
      id={id}
      className={`group ${className}`}
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className="list-none cursor-pointer min-h-[48px] flex items-center justify-between gap-3 py-3 -mx-2 px-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden [&::marker]:hidden hover:bg-sand-100/50 transition-colors" aria-expanded={open}>
        <span className={`${TYPE.subSectionTitleLg} text-charcoal`}>{summary}</span>
        <span
          className="text-olive/40 text-sm shrink-0 transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        >
          ▾
        </span>
      </summary>
      <div className="mt-5 sm:mt-7">{children}</div>
    </details>
  );
}
