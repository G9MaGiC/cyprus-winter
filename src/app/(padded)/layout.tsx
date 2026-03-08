import { LAYOUT } from "@/lib/design-tokens";

/**
 * Layout for pages that need top clearance below the fixed nav.
 * Home page (/) uses root layout directly with pt-0 so hero sits flush under nav.
 */
export default function PaddedLayout({ children }: { children: React.ReactNode }) {
  return <div className={LAYOUT.paddedTop}>{children}</div>;
}
