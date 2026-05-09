"use client";

type BookingTrustStripProps = {
  variant?: "winery" | "guide";
};

export default function BookingTrustStrip({ variant = "winery" }: BookingTrustStripProps) {
  const context = variant === "guide" ? "guide" : "partner";
  return (
    <section className="rounded-xl border border-aegean/20 bg-aegean/5 p-4" aria-label="Booking trust information">
      <p className="text-xs font-semibold uppercase tracking-wider text-aegean">Before you submit</p>
      <ul className="mt-2 space-y-1.5 text-sm text-olive/85">
        <li>Verified {context} request route.</li>
        <li>Confirmation usually arrives by email within 24 hours.</li>
        <li>No instant charge in-app; providers confirm availability first.</li>
      </ul>
    </section>
  );
}

