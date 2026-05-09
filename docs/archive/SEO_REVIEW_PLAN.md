**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# Cyprus Winter — SEO Teams Review Plan

**Version:** 1.0  
**Last updated:** March 2026  
**Teams:** TEAM_SEO, TEAM_TRAFFIC, seo-copywriter agent

A phased plan for the SEO teams to systematically review the Cyprus Winter project. Run phases in order; each produces findings and actionable recommendations.

---

## Overview

| Phase | Focus | Team / Subagent | Deliverable |
|-------|-------|-----------------|-------------|
| 1 | Discovery & gaps | explore, audit-explore | Gap list, page inventory |
| 2 | Meta, headings, snippets | seo-copywriter, content-polish | Before/after copy, file paths |
| 3 | Technical SEO | audit-explore | Technical audit report |
| 4 | Content & traffic opportunities | content-polish, seo-copywriter | Keyword roadmap, expansion ideas |
| 5 | Internal linking & conversion | explore, ux-polish | Link map, UX recommendations |

**Reference:** `.cursor/TEAM_SEO.md`, `.cursor/TEAM_TRAFFIC.md`, `.cursor/agents/seo-copywriter.md`

---

## Phase 1: Discovery & Gap Analysis

**Goal:** Inventory all indexable pages and identify missing metadata, alt text, and content gaps.

**Subagent:** `explore` (readonly), then `audit-explore`

### 1.1 Page inventory

```
Explore the Cyprus Winter app (Next.js).
List all routes that should be indexable:
- Layout, discover, trails, wineries, regions, team, secrets, search, airport, plan, bookings
- Dynamic: /discover/[id], /trails/[id], /wineries/[id], /events/[id]
- Any other public pages

Output: Table of routes, whether they have custom metadata, and whether they’re linked from sitemap/nav.
```

### 1.2 Content gaps

```
Find SEO content gaps in Cyprus Winter.
Check:
- Pages without custom title or description
- Attraction/trail/winery pages lacking good snippet text
- Missing or weak alt text on images
- Long-tail keyword opportunities (e.g. "best beaches Cyprus winter", "Troodos trail conditions December")

Reference: src/data/attractions.ts, trails.ts, wineries.ts
Output: Gap list with file paths and suggested copy.
```

**Deliverable:** `docs/SEO_REVIEW_PHASE1_GAPS.md` (or add to existing audit)

---

## Phase 2: Meta, Headings, Snippets & Alt Text

**Goal:** Optimize SERP appearance and CTR.

**Subagent:** `seo-copywriter` (agent), `content-polish`

### 2.1 Full meta & snippet audit

```
Use the agent at .cursor/agents/seo-copywriter.md

Audit and improve SEO for Cyprus Winter. Focus on:
- Meta titles and descriptions (layout, discover, trails, wineries, team, secrets, search, airport, plan)
- Heading hierarchy (h1, h2, h3) across all pages
- Keyword usage (Cyprus winter, trails, wineries, Troodos)
- Alt text for attraction and trail images
- Attraction/trail snippet descriptions (first 155 chars)

Provide before/after copy and file paths for each page.
```

### 2.2 Dynamic page metadata

```
Audit generateMetadata in src/app/discover/[id]/page.tsx and similar dynamic routes.
- Ensure titles and descriptions are unique per attraction/trail
- Check snippet text comes from data (attractions.ts, trails.ts) and is optimized
- Verify OG tags for dynamic pages

Output: Findings and suggested changes with file paths.
```

**Deliverable:** Before/after copy document with file paths

---

## Phase 3: Technical SEO Audit

**Goal:** Ensure crawlability, structured data, and technical best practices.

**Subagent:** `audit-explore`

### 3.1 Technical audit

```
Technical SEO audit for Cyprus Winter (Next.js tourism app).

Audit:
- Metadata exports in src/app/**/page.tsx and generateMetadata
- Layout metadata in src/app/layout.tsx
- Sitemap and robots.txt presence (next-sitemap or equivalent)
- Structured data (JSON-LD) opportunities: Attraction, Event, LocalBusiness, BreadcrumbList
- Canonical URL handling
- Internal link structure and broken links
- Core Web Vitals considerations (images, fonts, scripts)

Output: Structured report with severity, file paths, and recommended changes.
```

**Deliverable:** Technical SEO audit report

---

## Phase 4: Content & Traffic Opportunities

**Goal:** Identify high-value content and keyword opportunities for organic growth.

**Subagent:** `content-polish`, `seo-copywriter`

### 4.1 Keyword & content opportunity scan

```
You are the organic traffic strategist for Cyprus Winter.
Identify content and keyword opportunities for thousands of organic visitors per week.

Scope: Cyprus winter tourism, trails, wineries, beaches, Troodos, Paphos, Nissi, Lefkara.

Deliverables:
- 20–30 high-potential long-tail keywords
- Content gap analysis vs competitors
- Quick-win pages (e.g. "Cyprus winter weather by month", "Best Troodos trails December")
- Prioritized roadmap: P0 (fast) vs P1 (medium-term)

Reference: src/data/attractions.ts, trails.ts, wineries.ts
Output: Opportunity list with suggested routes and primary keywords.
```

### 4.2 Content expansion ideas

```
Propose new indexable pages for Cyprus Winter.
Current: layout, discover, trails, wineries, regions, team, secrets, search.

Evaluate:
- Region landing pages (Paphos winter, Troodos winter, Larnaca winter)
- "Best X in Cyprus winter" pillar pages
- Monthly guides (December, January, February)
- Trail conditions / seasonal guides

For each: primary keyword, suggested route, data sources, complexity.
Output: Prioritized content expansion roadmap.
```

**Deliverable:** Keyword roadmap + content expansion plan

---

## Phase 5: Internal Linking & Conversion

**Goal:** Improve link structure and engagement signals.

**Subagent:** `explore`, `ux-polish`

### 5.1 Internal linking audit

```
Explore Cyprus Winter app structure.
Design internal linking strategy:

- Identify hub pages (discover, trails, regions)
- Map spoke pages (attractions, trails, wineries)
- Find orphan or weakly linked pages
- Suggest anchor text for key pages
- Recommend hub pages (e.g. /discover/regions/[slug])

Output: Link map with file paths and suggested anchor text.
```

### 5.2 Conversion & engagement

```
You are the UX lead for traffic quality.
Review for engagement signals (dwell time, bounce, pogo-sticking):

- Above-the-fold content: does it match search intent?
- CTAs: clear next steps, internal links to related content
- Mobile experience: touch targets, readability
- Loading and empty/error states

Output: Top 5 UX changes that support SEO and reduce bounce.
```

**Deliverable:** Internal link map + UX recommendations

---

## Execution Order

```
Phase 1 (Discovery)  →  Phase 2 (Meta/Snippets)  →  Phase 3 (Technical)
                                                           ↓
Phase 5 (Links/UX)   ←  Phase 4 (Content/Traffic)
```

**Suggested run:**

1. Run Phase 1 first to get full context.
2. Phase 2 and 3 can run in parallel if using multiple agents.
3. Phase 4 uses Phase 1–3 findings.
4. Phase 5 can run last or in parallel with Phase 4.

---

## MCP Invocation Quick Reference

```javascript
// Phase 1
mcp_task({ subagent_type: "explore", prompt: "List all indexable routes in Cyprus Winter...", readonly: true })
mcp_task({ subagent_type: "explore", prompt: "Find SEO content gaps in Cyprus Winter...", readonly: true })

// Phase 2
mcp_task({ subagent_type: "seo-copywriter", prompt: "Audit and improve SEO for Cyprus Winter. Focus on meta, headings, alt text..." })
mcp_task({ subagent_type: "content-polish", prompt: "Audit generateMetadata and dynamic page SEO..." })

// Phase 3
mcp_task({ subagent_type: "audit-explore", prompt: "Technical SEO audit for Cyprus Winter: metadata, sitemap, structured data..." })

// Phase 4
mcp_task({ subagent_type: "content-polish", prompt: "Organic traffic strategist: keyword opportunities, content gaps, quick wins..." })
mcp_task({ subagent_type: "content-polish", prompt: "Content expansion for Cyprus Winter: new pages, region guides, pillar content..." })

// Phase 5
mcp_task({ subagent_type: "explore", prompt: "Internal linking strategy for Cyprus Winter...", readonly: true })
mcp_task({ subagent_type: "ux-polish", prompt: "Engagement optimization: reduce bounce, dwell time, CTAs, mobile UX..." })
```

---

## Key Files for Review

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Default metadata, OG defaults |
| `src/app/**/page.tsx` | Page-level metadata |
| `src/app/discover/[id]/page.tsx` | Dynamic attraction metadata |
| `src/data/attractions.ts` | Attraction content |
| `src/data/trails.ts` | Trail content |
| `src/data/wineries.ts` | Winery content |
| `next.config.ts` | Sitemap, rewrites |
