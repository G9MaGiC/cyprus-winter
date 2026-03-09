import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";
import { LAYOUT, SECTION } from "@/lib/design-tokens";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { CTA } from "@/lib/design-tokens";

export const metadata: Metadata = {
  title: "Terms of Service — Cyprus Winter",
  description:
    "Terms of use for Cyprus Winter: trip planning, bookings, trail conditions, and user-generated content.",
  alternates: { canonical: `${SITE_URL}/terms` },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <div className={`${LAYOUT.listNarrow} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        backHref="/"
        backLabel="Home"
        title="Terms of Service"
        description="Terms governing your use of Cyprus Winter. Last updated: March 2026."
        breadcrumbItems={[
          { label: "Home", href: "/" },
          { label: "Terms", href: "/terms", isCurrent: true },
        ]}
      />

      <article className={`prose prose-olive max-w-none ${SECTION.blockGap}`}>
        <section>
          <h2 className="font-display text-xl font-semibold text-charcoal mt-10 mb-3">
            1. Acceptance
          </h2>
          <p className="text-olive/90 leading-relaxed">
            By using Cyprus Winter (&quot;the service&quot;), you agree to these Terms of Service and our <Link href="/privacy" className="text-terracotta hover:underline">Privacy Policy</Link>. If you do not agree, do not use the service.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-charcoal mt-10 mb-3">
            2. Description of the service
          </h2>
          <p className="text-olive/90 leading-relaxed">
            Cyprus Winter provides tourism information, trip planning tools, trail conditions, and booking requests for wineries and guides in Cyprus. We are an informational and planning service, not a tour operator or booking agent. Winery and guide bookings are <strong>requests</strong>; confirmation depends on the partner. We do not guarantee availability or pricing.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-charcoal mt-10 mb-3">
            3. User-generated content (UGC)
          </h2>
          <p className="text-olive/90 leading-relaxed mb-4">
            You may submit content such as trail condition reports. By submitting, you:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-olive/90">
            <li>Grant us a non-exclusive, royalty-free licence to use, display, and modify the content for the service.</li>
            <li>Represent that you own or have the right to submit the content and that it does not violate any third-party rights or laws.</li>
            <li>Agree not to submit false, harmful, abusive, or illegal content.</li>
          </ul>
          <p className="text-olive/90 leading-relaxed mt-4">
            We may remove or edit content that violates these terms or our content policy. We are not responsible for user-generated content; responsibility lies with the submitter.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-charcoal mt-10 mb-3">
            4. Disclaimers
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-olive/90">
            <li>
              <strong>Trail conditions:</strong> Conditions are crowd-sourced and not guaranteed. Weather and trail status change. Check official sources and use your own judgement before hiking.
            </li>
            <li>
              <strong>Outdoor activities:</strong> Hiking and outdoor activities involve inherent risks. You assume responsibility for your safety. Prepare appropriately (weather, gear, fitness) and follow local regulations.
            </li>
            <li>
              <strong>Bookings:</strong> Submission of a booking form is a request, not a confirmed reservation. Partners confirm separately. We are not liable for partner availability, pricing, or conduct.
            </li>
            <li>
              <strong>AI content:</strong> Ask AI responses are for general information only. They may be inaccurate or incomplete. Do not rely on them for critical decisions (safety, legal, medical). Verify important information from authoritative sources.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-charcoal mt-10 mb-3">
            5. Alcohol content
          </h2>
          <p className="text-olive/90 leading-relaxed">
            Wine and winery content is intended for adults of legal drinking age. If you are under the legal age in your jurisdiction, please do not use winery booking or related features. Drink responsibly.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-charcoal mt-10 mb-3">
            6. Limitation of liability
          </h2>
          <p className="text-olive/90 leading-relaxed">
            To the fullest extent permitted by law, Cyprus Winter and its operators are not liable for any indirect, incidental, special, or consequential damages arising from your use of the service, including but not limited to reliance on trail conditions, AI responses, or booking outcomes. Our total liability is limited to the amount you paid to us (if any) in the 12 months preceding the claim, or zero if you have not paid. Some jurisdictions do not allow these limitations; in such cases our liability is limited to the maximum permitted by law.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-charcoal mt-10 mb-3">
            7. Governing law and disputes
          </h2>
          <p className="text-olive/90 leading-relaxed">
            These terms are governed by the laws of the Republic of Cyprus. Any disputes shall be resolved in the courts of Cyprus. EU consumers retain the right to bring claims in their country of residence.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-charcoal mt-10 mb-3">
            8. Changes
          </h2>
          <p className="text-olive/90 leading-relaxed">
            We may update these terms. Material changes will be noted at the top. Continued use after changes constitutes acceptance. If you do not agree, discontinue use.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-charcoal mt-10 mb-3">
            9. Contact
          </h2>
          <p className="text-olive/90 leading-relaxed">
            For questions about these terms: <strong>legal@cypruswinter.com</strong> (or use the contact method provided on our site).
          </p>
        </section>
      </article>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link href="/privacy" className={CTA.secondaryCompact}>
          Privacy Policy
        </Link>
        <Link href="/" className={CTA.chipTertiary}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
