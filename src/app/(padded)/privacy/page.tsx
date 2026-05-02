import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { applyLocaleToMetadata } from "@/lib/locale-seo";
import { privacyPageMeta } from "@/lib/locale-page-meta";
import { LAYOUT, SECTION } from "@/lib/design-tokens";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { CTA } from "@/lib/design-tokens";

export const metadata: Metadata = applyLocaleToMetadata(
  privacyPageMeta,
  "/privacy",
  routing.defaultLocale
);

export default function PrivacyPage() {
  return (
    <div className={`${LAYOUT.listNarrow} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        backHref="/"
        backLabel="Home"
        title="Privacy Policy"
        description="How we collect, use, and protect your data. Last updated: March 2026."
        breadcrumbItems={[
          { label: "Home", href: "/" },
          { label: "Privacy", href: "/privacy", isCurrent: true },
        ]}
      />

      <article className={`prose prose-olive max-w-none ${SECTION.blockGap}`}>
        <section>
          <h2 className="font-display text-xl font-semibold text-charcoal mt-10 mb-3">
            1. Who we are
          </h2>
          <p className="text-olive/90 leading-relaxed">
            Cyprus Winter (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a tourism information and trip-planning service. This privacy policy explains how we process your personal data when you use our website and services.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-charcoal mt-10 mb-3">
            2. Data we collect and how we use it
          </h2>
          <p className="text-olive/90 leading-relaxed mb-4">
            We collect the following data, for the purposes and legal bases stated below:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-olive/90">
            <li>
              <strong>Conversion and usage data</strong> (session ID, path, user-agent, event name): to understand how the service is used and improve it. <em>Legal basis: Legitimate interest.</em>
            </li>
            <li>
              <strong>Booking data</strong> (email, name, experience and date): to process winery and guide booking requests and communicate with you. <em>Legal basis: Contract performance.</em>
            </li>
            <li>
              <strong>Trail reports</strong> (note, optional email): to display crowd-sourced trail conditions. <em>Legal basis: Legitimate interest; consent where email is provided.</em>
            </li>
            <li>
              <strong>Chat messages</strong>: when you use Ask AI, your messages and context are sent to AI providers (OpenAI, xAI, Groq, Moonshot) to generate responses. <em>Legal basis: Legitimate interest.</em>
            </li>
            <li>
              <strong>Local preferences</strong> (interests, regions, itinerary): stored in your browser only. Not sent to our servers except as needed for features (e.g. plan share links).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-charcoal mt-10 mb-3">
            3. Data processors and transfers
          </h2>
          <p className="text-olive/90 leading-relaxed mb-4">
            We use the following processors to operate the service:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-olive/90">
            <li><strong>Supabase</strong> — database and storage (conversion events, bookings, trail reports)</li>
            <li><strong>Resend</strong> — email delivery for booking confirmations</li>
            <li><strong>AI providers</strong> — OpenAI, xAI, Groq, Moonshot — for Ask AI chat responses</li>
            <li><strong>Vercel</strong> — hosting and analytics (anonymized)</li>
          </ul>
          <p className="text-olive/90 leading-relaxed mt-4">
            Data may be transferred to countries outside the EU. We rely on adequacy decisions or appropriate safeguards (e.g. Standard Contractual Clauses) where required.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-charcoal mt-10 mb-3">
            4. Retention
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-olive/90">
            <li><strong>Conversion events:</strong> Up to 2 years.</li>
            <li><strong>Bookings:</strong> As needed for booking follow-up and legal obligations (typically up to 2 years after the experience date).</li>
            <li><strong>Trail reports:</strong> Indefinitely, unless you request deletion (see below).</li>
            <li><strong>Chat messages:</strong> Not stored long-term; processed in real time by AI providers per their policies.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-charcoal mt-10 mb-3">
            5. Your rights (GDPR)
          </h2>
          <p className="text-olive/90 leading-relaxed mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-olive/90">
            <li>Access your data</li>
            <li>Rectify inaccurate data</li>
            <li>Request erasure (&quot;right to be forgotten&quot;)</li>
            <li>Restrict processing</li>
            <li>Data portability (export)</li>
            <li>Object to processing</li>
            <li>Withdraw consent (where applicable)</li>
            <li>Lodge a complaint with a supervisory authority</li>
          </ul>
          <p className="text-olive/90 leading-relaxed mt-4">
            To exercise these rights, contact us at the email below. For data linked to a booking, include the email address used. For trail reports, include the email if you provided one. We will respond within 30 days.
          </p>
        </section>

        <section id="cookies">
          <h2 className="font-display text-xl font-semibold text-charcoal mt-10 mb-3">
            6. Cookies and similar technologies
          </h2>
          <p className="text-olive/90 leading-relaxed mb-4">
            We use cookies and local storage for:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-olive/90">
            <li><strong>Essential:</strong> Session, preferences, and functionality (e.g. plan, language).</li>
            <li><strong>Analytics:</strong> Anonymized usage (if you consent).</li>
          </ul>
          <p className="text-olive/90 leading-relaxed mt-4">
            You can manage cookie preferences via the cookie banner or your browser settings. Essential cookies cannot be disabled without limiting functionality.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-charcoal mt-10 mb-3">
            7. Security
          </h2>
          <p className="text-olive/90 leading-relaxed">
            We use HTTPS, secure storage, and follow industry best practices. We do not log or store PII in client-side analytics beyond what is strictly necessary.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-charcoal mt-10 mb-3">
            8. Changes
          </h2>
          <p className="text-olive/90 leading-relaxed">
            We may update this policy. Material changes will be noted at the top. Continued use after changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-charcoal mt-10 mb-3">
            9. Contact
          </h2>
          <p className="text-olive/90 leading-relaxed">
            For privacy requests, data export, or deletion: <strong>privacy@cypruswinter.com</strong> (or use the contact method provided on our site).
          </p>
        </section>
      </article>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link href="/terms" className={CTA.secondaryCompact}>
          Terms of Service
        </Link>
        <Link href="/" className={CTA.chipTertiary}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
