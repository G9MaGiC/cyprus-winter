"use client";

export default function BackToTopLink() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="text-white/70 hover:text-white text-sm font-medium uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/60 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal rounded min-h-[44px] inline-flex items-center"
    >
      Back to top
    </button>
  );
}
