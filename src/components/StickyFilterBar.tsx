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
      className={`sticky ${LAYOUT.stickyTop} z-10 bg-background/98 backdrop-blur-md border-b border-sand-200/60 ${LAYOUT.stickyBarX} py-4 sm:py-5`}
    >
      {children}
    </div>
  );
}

