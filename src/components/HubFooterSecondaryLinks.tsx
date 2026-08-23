import type { ReactNode } from "react";

/** Flex-wrap secondary links for hub footers — avoids cramped inline separators on narrow viewports. */
export default function HubFooterSecondaryLinks({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-olive/70 max-w-md mx-auto">
      {children}
    </div>
  );
}
