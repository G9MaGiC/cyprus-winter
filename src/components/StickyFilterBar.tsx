"use client";

import type { ReactNode } from "react";
import { LAYOUT } from "@/lib/design-tokens";

type StickyFilterBarProps = {
  ariaLabel: string;
  children: ReactNode;
  role?: "region" | "group";
};

export default function StickyFilterBar({
  ariaLabel,
  role = "region",
  children,
}: StickyFilterBarProps) {
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className={`sticky ${LAYOUT.stickyTop} z-10 bg-background/98 backdrop-blur-xl border-b border-sand-200/70 shadow-[0_1px_0_rgba(201,111,82,0.04)] ${LAYOUT.stickyBarX} py-4 sm:py-5`}
    >
      {children}
    </div>
  );
}

