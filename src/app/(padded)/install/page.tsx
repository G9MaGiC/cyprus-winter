import Link from "next/link";
import BackLink from "@/components/BackLink";
import { LAYOUT, CARD, CTA, SECTION, TYPE } from "@/lib/design-tokens";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Install on SiteGround | Cyprus Winter",
  description: "Step-by-step instructions to deploy Cyprus Winter on SiteGround shared hosting. Static export, upload, and .htaccess setup.",
  robots: { index: false, follow: false },
};

const steps = [
  {
    title: "1. Configure for static export",
    body: "Add these to next.config.ts so Next.js generates static HTML instead of a Node server:",
    code: `const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // ... existing config
};`,
    note: "API routes will not work on SiteGround—use Supabase or another backend if needed.",
  },
  {
    title: "2. Build the static export",
    body: "On your computer, ensure Node.js 18+ is installed. Install dependencies and build:",
    code: `npm install
npm run build`,
    note: "The build outputs to the out/ folder. SiteGround cannot run Node.js—you deploy static files only.",
  },
  {
    title: "3. Upload to SiteGround",
    body: "Upload the contents of the out/ folder to your site's public_html directory. Use cPanel File Manager, FTP, or SFTP.",
    code: "Upload: out/*  →  public_html/",
    note: "Upload everything inside out/, including the _next folder and index.html. Do not upload the out folder itself—only its contents.",
  },
  {
    title: "4. Add .htaccess for routing",
    body: "Create a .htaccess file in public_html so direct links (e.g. /trails, /discover) work correctly:",
    code: `RewriteEngine On
RewriteBase /
RewriteRule ^index\\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]`,
    note: "This sends 404s for missing files to index.html so the app can handle routing. Adjust RewriteBase if the app lives in a subfolder.",
  },
  {
    title: "5. Verify",
    body: "Open your domain in a browser. Check the homepage, trails, and discover pages. Links and images should load.",
  },
];

export default function InstallPage() {
  return (
    <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <div className="mb-8">
        <BackLink href="/" label="Back to Cyprus Winter" />
      </div>

      <header className={SECTION.headingMarginLarge}>
        <p className="text-golden text-sm font-medium tracking-[0.15em] uppercase mb-2">
          Deployment guide
        </p>
        <h1 className={`${TYPE.pageTitle} text-charcoal mt-2`}>
          Install on SiteGround
        </h1>
        <p className="mt-3 text-olive/80 text-base leading-relaxed max-w-xl">
          Cyprus Winter runs as static HTML, CSS, and JavaScript. SiteGround shared hosting can serve it directly—no Node.js required.
        </p>
      </header>

      <section aria-labelledby="requirements" className="mb-12">
        <h2 id="requirements" className={`${TYPE.sectionTitle} mb-4`}>
          Requirements
        </h2>
        <ul className={`${CARD.base} ${CARD.content} space-y-2 text-olive/90`}>
          <li>• Node.js 18+ (for building locally)</li>
          <li>• SiteGround shared hosting with cPanel or FTP access</li>
          <li>• Domain pointed to your SiteGround account</li>
        </ul>
      </section>

      <section aria-labelledby="steps" className="space-y-10 mt-16 sm:mt-20">
        <h2 id="steps" className={`${TYPE.sectionTitle} mb-6`}>
          Steps
        </h2>

        {steps.map((step, i) => (
          <article
            key={i}
            className={`${CARD.base} ${CARD.hover} ${CARD.contentLg}`}
            aria-labelledby={`step-${i}`}
          >
            <h3 id={`step-${i}`} className={`${TYPE.cardTitle} text-charcoal mb-3`}>
              {step.title}
            </h3>
            <p className="text-olive/90 text-sm sm:text-base leading-relaxed mb-4">
              {step.body}
            </p>
            {step.code && (
              <pre
                className="rounded-lg bg-charcoal text-white p-4 overflow-x-auto text-sm font-mono mb-4"
                role="region"
                aria-label="Code snippet"
              >
                <code>{step.code}</code>
              </pre>
            )}
            {step.note && (
              <p className="text-olive/70 text-sm leading-relaxed italic">
                {step.note}
              </p>
            )}
          </article>
        ))}
      </section>

      <section aria-labelledby="troubleshooting" className={SECTION.footerBlock}>
        <h2 id="troubleshooting" className={`${TYPE.sectionTitle} mb-4`}>
          Troubleshooting
        </h2>
        <ul className="space-y-3 text-olive/90 text-sm">
          <li>
            <strong className="text-charcoal">Blank page or 404 on refresh:</strong> Add or fix the .htaccess rewrite rules above.
          </li>
          <li>
            <strong className="text-charcoal">Images not loading:</strong> Ensure <code className="rounded bg-sand-200 px-1 py-0.5">images.unoptimized: true</code> is set in next.config. Image paths must be correct in the built output.
          </li>
          <li>
            <strong className="text-charcoal">API or chat not working:</strong> SiteGround shared hosting cannot run Next.js API routes. Use Supabase, Vercel serverless, or another backend and point the app to it.
          </li>
        </ul>
      </section>

      <div className="mt-16 sm:mt-20 flex flex-wrap gap-4">
        <Link href="/" className={`px-8 py-3 rounded-xl ${CTA.primaryCompact}`}>
          Back to app
        </Link>
      </div>
    </div>
  );
}
