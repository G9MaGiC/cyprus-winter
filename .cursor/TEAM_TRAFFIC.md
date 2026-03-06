# Cyprus Winter — Organic Traffic Growth Team

A top-tier team of subagents focused on scaling organic traffic to thousands of visitors per week. Use when you need systematic, high-volume organic growth (SEO, content, technical, local, conversion).

**Reference:** `.cursor/agents/seo-copywriter.md`, `TEAM_SEO.md`, `PRD.md`, `UX_PERSONA.md`, `src/data/`, `src/app/**/page.tsx`  
**Review plan:** `docs/SEO_REVIEW_PLAN.md` — phased runbook for full project review

---

## Team Roster

| Role | Subagent Type | Focus | Traffic Impact |
|------|---------------|-------|----------------|
| **Keyword & content strategy** | `seo-copywriter` / `content-polish` | High-volume keyword research, content gaps, long-tail opportunities | High — content drives majority of organic traffic |
| **Technical SEO** | `audit-explore` | Core Web Vitals, sitemap, structured data, crawlability | High — ranking & snippet visibility |
| **Content creation & polish** | `content-polish` | Blog-style pages, destination guides, snippet optimization | High — more indexable content = more entry points |
| **Site architecture & discovery** | `explore` + `senior-software-engineer` | Internal linking, landing pages, topical clusters | Medium–High — distributes authority and surfaces content |
| **Conversion & engagement** | `ux-polish` | Bounce rate, time on site, CTAs, mobile experience | Medium — improves dwell time and rankings |

---

## Traffic Growth Tactics (Thousands/Week)

| Tactic | Goal | Subagent | Example |
|--------|------|----------|---------|
| **Long-tail content** | 50–200+ long-tail pages | content-polish, seo-copywriter | "Best wineries Cyprus winter", "Troodos snow December", "Nissi Beach winter temperature" |
| **Structured data** | Rich snippets, FAQ, LocalBusiness | senior-software-engineer, audit-explore | JSON-LD for attractions, events, breadcrumbs |
| **Internal linking** | Pass authority, reduce bounce | explore, content-polish | Hub pages → trails, wineries, regions |
| **Meta & OG optimization** | Higher CTR in SERPs | seo-copywriter | Compelling titles/descriptions per page |
| **Alt text & image SEO** | Image search traffic | seo-copywriter | Descriptive alt on all attraction/trail images |
| **Local SEO** | "Near me", Cyprus queries | content-polish | Region pages, location-rich copy |

---

## Invocation Prompts

### 1. Keyword & Content Opportunity Scan

Use when: planning new content or expanding existing pages for maximum traffic.

```
You are the organic traffic strategist for Cyprus Winter.
Task: Identify content and keyword opportunities that can drive thousands of organic visitors per week.

Scope: Cyprus winter tourism, trails, wineries, beaches, Troodos, Paphos, Nissi, Lefkara, etc.

Deliverables:
- 20–30 high-potential long-tail keywords (search intent, volume estimate, competition)
- Content gap analysis: what we don't have yet that competitors rank for
- Quick-win pages (e.g. "Cyprus winter weather by month", "Best Troodos trails December")
- Prioritized roadmap: P0 (fast traffic) vs P1 (medium-term)

Reference: src/data/attractions.ts, trails.ts, wineries.ts — what can be turned into indexable landing pages?
Output: Structured opportunity list with suggested page routes and primary keywords.
```

### 2. Technical SEO for Scale

```
You are the technical SEO lead for Cyprus Winter.
Audit for traffic scale:

- Core Web Vitals (LCP, FID, CLS) — impact on rankings
- Sitemap: coverage, priority, lastmod
- Structured data (JSON-LD): Attraction, Event, LocalBusiness, BreadcrumbList
- Canonical URLs, duplicate content risks
- Mobile usability and crawlability
- Internal link structure: hub → spoke model for topics

Output: Findings with severity, file paths, and concrete implementation steps.
Target: Ensure every indexable page can rank and appear in rich results.
```

### 3. Content Expansion (More Indexable Pages)

```
You are the content growth lead for Cyprus Winter.
Task: Propose new pages and content that can bring thousands of organic visits per week.

Current content: layout, discover, trails, wineries, regions, team, secrets, search.

Ideas to evaluate:
- Region landing pages (Paphos winter, Troodos winter, Larnaca winter)
- "Best X in Cyprus winter" pillar pages
- Monthly guides (December, January, February)
- Trail conditions / seasonal guides
- Event listing pages with unique content per event

For each idea:
- Primary keyword, search intent
- Suggested route (e.g. /discover/regions/paphos)
- Data sources (attractions.ts, trails.ts, etc.)
- Implementation complexity

Output: Prioritized content expansion roadmap with file paths and data dependencies.
```

### 4. Meta, Alt, and Snippet Optimization (SERP CTR)

```
You are the SERP optimization lead for Cyprus Winter.
Task: Maximize click-through rate from search results.

Audit:
- Meta title (under 60 chars, keyword-rich, compelling)
- Meta description (150–160 chars, benefit-led, urgency/curiosity)
- Attraction/trail snippet text (first 155 chars)
- Alt text on all images — include location + winter context
- OG/twitter tags for social sharing

Reference: src/app/layout.tsx, src/app/**/page.tsx, src/data/attractions.ts, trails.ts
Output: Before/after copy for top 15–20 pages, with file paths.
```

### 5. Internal Linking & Hub Structure

```
Explore the Cyprus Winter app structure.
Task: Design internal linking strategy for maximum organic traffic flow.

- Identify hub pages (e.g. discover, trails, regions)
- Map spoke pages (individual attractions, trails, wineries)
- Find orphan pages (no incoming links)
- Suggest anchor text for key pages
- Recommend new hub pages (e.g. /discover/regions/[slug])

Output: Link map with file paths and suggested anchor text.
```

### 6. Conversion & Engagement (Lower Bounce, Better Signals)

```
You are the UX lead for traffic quality.
Task: Improve engagement signals to support organic rankings (dwell time, bounce, pogo-sticking).

Review:
- Above-the-fold content: does it match search intent?
- CTAs: clear next steps, internal links to related content
- Mobile experience: touch targets, readability
- Loading states: perceived performance
- Empty/error states: keep users on site

Output: Top 5 UX changes that would improve engagement and support SEO.
```

---

## Workflow for Thousands/Week

| Phase | Role | Action |
|-------|------|--------|
| 1 | Keyword & content strategy | Identify high-volume opportunities, content gaps |
| 2 | Content creation/expansion | New pages, pillar content, region guides |
| 3 | Meta & snippet optimization | Higher CTR in SERPs |
| 4 | Technical SEO | Structured data, sitemap, Core Web Vitals |
| 5 | Internal linking | Pass authority, reduce bounce |
| 6 | UX/conversion | Improve dwell time, reduce bounce |

---

## MCP Invocation (mcp_task)

```javascript
// Keyword & content opportunity
mcp_task({ subagent_type: "content-polish", prompt: "Organic traffic strategist: identify keyword opportunities, content gaps, quick wins for Cyprus Winter..." })

// Technical SEO
mcp_task({ subagent_type: "audit-explore", prompt: "Technical SEO audit for scale: Core Web Vitals, structured data, sitemap, internal linking..." })

// Content expansion
mcp_task({ subagent_type: "explore", prompt: "Content expansion for Cyprus Winter: new indexable pages, region guides, pillar content...", readonly: true })

// Meta/snippet optimization
mcp_task({ subagent_type: "seo-copywriter", prompt: "SERP optimization: meta titles, descriptions, alt text, snippets for top pages..." })

// Internal linking
mcp_task({ subagent_type: "explore", prompt: "Internal linking strategy for Cyprus Winter: hub-spoke, orphan pages, anchor text...", readonly: true })

// Conversion & engagement
mcp_task({ subagent_type: "ux-polish", prompt: "Engagement optimization: reduce bounce, improve dwell time, CTAs, mobile UX..." })
```

---

## Key Targets (Thousands/Week)

| Metric | Target | Levers |
|--------|--------|--------|
| Organic sessions | 1k–10k+/week | Content volume, keyword coverage |
| Indexed pages | 50–150+ | New landing pages, region/topic hubs |
| Avg. position (top keywords) | < 15 | Technical SEO, content quality |
| CTR (SERP) | 3–8% | Meta, snippets, structured data |
| Bounce rate | < 55% | UX, intent matching, internal links |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Default metadata |
| `src/app/**/page.tsx` | Page metadata, content |
| `src/app/discover/[id]/page.tsx` | Dynamic attraction pages |
| `src/data/attractions.ts`, `trails.ts`, `wineries.ts` | Content source for new pages |
| `next.config.ts` | Sitemap, rewrites |
| `.cursor/agents/seo-copywriter.md` | SEO agent |
