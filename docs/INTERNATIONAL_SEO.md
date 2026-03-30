# International URLs and SEO (Decision log)

**Adopted strategy: A — single canonical (English-default path)**

- **Canonical URLs** for each logical page use the **default locale path** with `localePrefix: "as-needed"`: unprefixed paths such as `/discover`, `/trails`, `https://example.com/` for the home page.
- **Localized URLs** (`/de/discover`, `/el/plan`, …) exist for UX and are linked in **`hreflang`** (including **`x-default`** pointing at the canonical) so crawlers understand the cluster without treating each locale URL as a separate primary document.
- The **sitemap** ([`src/app/sitemap.ts`](../src/app/sitemap.ts)) lists **only** those canonical (unprefixed) URLs, consistent with Strategy A.

If the product later needs **per-locale ranking** (Strategy B), revisit: locale-specific canonicals, expanded sitemap entries per locale, and full hreflang on every template—prefer a shared metadata helper to avoid drift.

See also: [`src/lib/seo-locale-urls.ts`](../src/lib/seo-locale-urls.ts).
