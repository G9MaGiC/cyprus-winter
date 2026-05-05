# Cyprus Winter — SEO (living checklist)

**Owner:** SEO / Growth  
**Last updated:** May 2026  
**Scope:** metadata, canonicals, sitemap/robots, structured data, internal linking, and Core Web Vitals basics.

This is the **canonical** SEO document. Historical SEO audits live in `docs/archive/`.

## 1) What “good” looks like (project-specific)

- **Winter-differentiated positioning** consistently reflected in titles/descriptions (see `.cursor/PRODUCT_DEEP.md` + `docs/MESSAGING.md`).
- **Locale-aware URLs**: routes exist both as root (`/discover`) and locale (`/el/...`) with `next-intl` (`localePrefix: "as-needed"`).
- **Index control**: sensitive/utility pages are `noindex` (e.g. account, report forms), and excluded from sitemap.

## 2) Metadata (required)

- Root baseline metadata lives in `src/app/layout.tsx` (title/description/OG/Twitter + `metadataBase`).
- Pages with `generateMetadata` must set:
  - **title**, **description**
  - **alternates.canonical** when the route has many variants or params (especially dynamic routes).

### Recommended project conventions

- **Homepage**: it’s fine to inherit from layout, but keeping explicit `metadata` in `src/app/page.tsx` is acceptable if you want code-level clarity.
- **Dynamic pages**: prefer setting `openGraph.images`/`twitter.images` from the hero image when available (improves sharing and click-through).

## 3) Sitemap + robots (required)

- `src/app/sitemap.ts` should include all **indexable** routes.\n- `src/app/robots.ts` should disallow `/api/` and `/admin/` and point to the sitemap.

Checklist:
- [ ] Indexable pages appear in sitemap\n- [ ] `noindex` pages do not appear in sitemap\n- [ ] `NEXT_PUBLIC_SITE_URL` is set in production so absolute URLs are correct

## 4) Structured data (JSON-LD)

Minimum:
- Root `WebSite` schema in `src/app/layout.tsx`
- `BreadcrumbList` for key detail pages

Checklist:
- [ ] `/discover/[id]` has attraction/business schema + breadcrumbs\n- [ ] `/trails/[id]` has trail schema + breadcrumbs\n- [ ] `/events` has an `ItemList` of `Event`

Optional enhancements:
- Region landing pages: `BreadcrumbList` + `Place`/`TouristDestination`\n- Wine routes: `BreadcrumbList`\n- Booking pages: breadcrumbs + business schema alignment

## 5) Internal linking (crawl + intent)

Guidelines:
- Every hub page should link to its spokes with **descriptive anchor text** (names are fine).
- Ensure “orphan-ish” pages are reachable from **nav or footer**, not only via sitemap:
  - beaches, villages, wineries, weather, regions, guides.

## 6) Core Web Vitals quick checks

- Only one `priority` image per page (LCP candidate).
- Ensure `sizes` is set for major images to avoid over-downloading.
- Keep client-only scripts lazy where possible (analytics, trackers).

## 7) Process

- Use `docs/SEO_REVIEW_PLAN.md` as the **process/cadence** doc (if kept), but keep the checklist and “rules” here.
- Archive point-in-time audits to `docs/archive/` and add a header pointing back to `docs/SEO.md`.

