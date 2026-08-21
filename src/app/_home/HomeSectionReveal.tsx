"use client";

import { useEffect, useState, type ReactNode } from "react";

type HomeSectionRevealProps = {
  children: ReactNode;
  /** Stagger index 0–2 for the first three home content sections */
  index: number;
};

/** First-paint section reveal — mirrors DiscoverSectionList (max 3, 60ms stagger, 700ms gate). */
export default function HomeSectionReveal({ children, index }: HomeSectionRevealProps) {
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShouldAnimate(false), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={shouldAnimate ? "section-reveal" : undefined}
      style={shouldAnimate ? { animationDelay: `${index * 60}ms` } : undefined}
    >
      {children}
    </div>
  );
}
