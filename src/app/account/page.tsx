import type { Metadata } from "next";
import Link from "next/link";
import { LAYOUT, CTA } from "@/lib/design-tokens";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "My account | Cyprus Winter",
  description:
    "Sign in to sync your plan and bookings across devices. Your itinerary and tasting requests will follow you wherever you go.",
  robots: { index: false, follow: true },
};

export default function AccountPage() {
  return (
    <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        title="My account"
        description="Sign in (coming soon) will sync your plan and bookings across devices."
      />

      <div className="mt-12 p-8 rounded-lg bg-sand-100/90 border border-sand-200/70 text-center">
        <p className="text-olive font-semibold">Sign in coming soon</p>
        <p className="text-sm text-olive/80 mt-2 max-w-md mx-auto break-words">
          Your plan and bookings live on this device. Use the email lookup on the bookings page to pull in reservations from another device.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/bookings" className={`px-6 py-3 ${CTA.primaryCompact}`}>
            View my bookings
          </Link>
          <Link href="/plan" className={`px-6 py-3 ${CTA.secondaryCompact}`}>
            My plan
          </Link>
        </div>
      </div>
    </div>
  );
}
