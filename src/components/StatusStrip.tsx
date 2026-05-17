import AppLink from "@/components/AppLink";
import { LAYOUT, STRIP } from "@/lib/design-tokens";
import type { ReactNode } from "react";

type StripVariant = "sand" | "aegean";

const SURFACE: Record<StripVariant, string> = {
  sand: STRIP.surfaceSand,
  aegean: STRIP.surfaceAegean,
};

type StatusStripProps = {
  variant?: StripVariant;
  labelledBy: string;
  children: ReactNode;
};

/** Full-width status strip wrapper (weather, trail conditions, reminders). */
export function StatusStrip({ variant = "sand", labelledBy, children }: StatusStripProps) {
  return (
    <section aria-labelledby={labelledBy} className={`${LAYOUT.safeAreaX} ${STRIP.py} ${SURFACE[variant]}`}>
      <div className={`${LAYOUT.list} mx-auto`}>{children}</div>
    </section>
  );
}

type StatusStripLinkProps = {
  href: string;
  ariaLabel: string;
  layout?: "center" | "split";
  children: ReactNode;
};

export function StatusStripLink({
  href,
  ariaLabel,
  layout = "center",
  children,
}: StatusStripLinkProps) {
  return (
    <AppLink
      href={href}
      aria-label={ariaLabel}
      className={layout === "center" ? STRIP.linkCentered : STRIP.linkSplit}
    >
      {children}
    </AppLink>
  );
}

/** Primary value + secondary hint on one line (e.g. coast/Troodos temps + tip). */
export function StatusStripInlineStat({
  id,
  primary,
  secondary,
}: {
  id: string;
  primary: string;
  secondary: string;
}) {
  return (
    <p id={id} className={STRIP.inlineRow}>
      <span className={STRIP.inlinePrimary}>{primary}</span>
      <span className={STRIP.inlineSecondary}> · {secondary}</span>
    </p>
  );
}
