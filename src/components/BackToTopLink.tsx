"use client";

import { CTA } from "@/lib/design-tokens";

export default function BackToTopLink() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`${CTA.tertiaryOnDark} hover:bg-transparent uppercase tracking-wider`}
    >
      Back to top
    </button>
  );
}
