**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# Cyprus Winter — SEO Execution Plan

**Ref:** `docs/SEO_REVIEW_PLAN.md`, `.cursor/TEAM_SEO.md`, `docs/SEO_ROADMAP.md`  
**Started:** March 2026

Step-by-step runbook for executing the SEO plan. Start with Phase 1.

---

## Execution Flow

```
Phase 1 (Discovery)  →  Phase 2 (Meta/Snippets)  →  Phase 3 (Technical)
                                                           ↓
Phase 5 (Links/UX)   ←  Phase 4 (Content/Traffic)
```

---

## Phase 1: Discovery & Gap Analysis (START HERE)

**Goal:** Inventory all indexable pages and find missing metadata, alt text, and content gaps.  
**Subagents:** `explore` (readonly), then `audit-explore`  
**Deliverable:** `docs/SEO_REVIEW_PHASE1_GAPS.md`

### Step 1.1 — Page inventory

**Invoke:**
```
mcp_task({
  subagent_type: "explore",
  prompt: "Explore the Cyprus Winter app (Next.js). List all routes that should be indexable: layout, discover, trails, wineries, regions, team, secrets, search, airport, plan, bookings; dynamic routes /discover/[id], /trails/[id], /book/winery/[id], /regions/[slug], /weather/[month], etc. For each route, indicate whether it has custom metadata and whether it's linked from sitemap/nav. Output a table of routes, metadata status, and sitemap/nav status.",
  readonly: true
})
```

**Output:** Table of all indexable routes with metadata and discoverability status.

---

### Step 1.2 — Content gaps

**Invoke:**
```
mcp_task({
  subagent_type: "explore",
  prompt: "Find SEO content gaps in Cyprus Winter. Check: (1) Pages without custom title or description; (2) Attraction/trail/winery pages lacking good snippet text (first 155 chars); (3) Missing or weak alt text on images in src/data/ and public/images/cyprus/; (4) Long-tail keyword opportunities (e.g. 'best beaches Cyprus winter', 'Troodos trail conditions December'). Reference: src/data/attractions.ts, trails.ts, wineries.ts. Output a gap list with file paths and suggested copy.",
  readonly: true
})
```

**Output:** Gap list with file paths and suggested copy.

---

### Step 1.3 — Consolidate (optional audit pass)

**Invoke:**
```
mcp_task({
  subagent_type: "audit-explore",
  prompt: "Audit Cyprus Winter for SEO gaps. Using the project structure, identify: missing page metadata, duplicate content risks, orphan pages, weak internal linking for key routes. Cross-check src/app/**/page.tsx and layout.tsx. Output findings with severity (P0/P1/P2) and file paths."
})
```

**Output:** Prioritized audit findings.

---

### Phase 1 Done

- [ ] Page inventory complete
- [ ] Content gaps documented
- [ ] Deliverable written to `docs/SEO_REVIEW_PHASE1_GAPS.md` (or summarized in agent output)

**Next:** Phase 2 — Meta, headings, snippets & alt text

---

## Phase 2: Meta, Headings, Snippets & Alt Text

**Goal:** Optimize SERP appearance and CTR.  
**Subagents:** `seo-copywriter`, `content-polish`  
**Deliverable:** Before/after copy with file paths

### Step 2.1 — Full meta & snippet audit

```
mcp_task({
  subagent_type: "seo-copywriter",
  prompt: "Audit and improve SEO for Cyprus Winter. Focus on: meta titles and descriptions (layout, discover, trails, wineries, team, secrets, search, airport, plan); heading hierarchy (h1, h2, h3); keyword usage; alt text for attraction and trail images; attraction/trail snippet descriptions (first 155 chars). Provide before/after copy and file paths."
})
```

### Step 2.2 — Dynamic page metadata

```
mcp_task({
  subagent_type: "content-polish",
  prompt: "Audit generateMetadata in src/app/discover/[id]/page.tsx, trails/[id]/page.tsx, and similar dynamic routes. Ensure titles and descriptions are unique per attraction/trail; snippet text from data is optimized; OG tags for dynamic pages are correct. Output findings and suggested changes with file paths."
})
```

---

## Phase 3: Technical SEO Audit

**Goal:** Crawlability, structured data, technical best practices.  
**Subagent:** `audit-explore`  
**Deliverable:** Technical SEO audit report

### Step 3.1 — Technical audit

```
mcp_task({
  subagent_type: "audit-explore",
  prompt: "Technical SEO audit for Cyprus Winter (Next.js tourism app). Audit: metadata in src/app/**/page.tsx and layout.tsx; sitemap and robots.txt; structured data (JSON-LD) opportunities: Attraction, Event, LocalBusiness, BreadcrumbList; canonical URLs; internal links and broken links; Core Web Vitals (images, fonts, scripts). Output report with severity, file paths, and recommended changes."
})
```

---

## Phase 4: Content & Traffic Opportunities

**Goal:** High-value content and keyword opportunities.  
**Subagents:** `content-polish`, `seo-copywriter`  
**Deliverable:** Keyword roadmap + content expansion plan

### Step 4.1 — Keyword opportunity scan

```
mcp_task({
  subagent_type: "content-polish",
  prompt: "Organic traffic strategist for Cyprus Winter. Identify content and keyword opportunities. Scope: Cyprus winter tourism, trails, wineries, beaches, Troodos, Paphos, Nissi, Lefkara. Deliverables: 20–30 long-tail keywords; content gap analysis; quick-win pages; P0 vs P1 roadmap. Reference: src/data/attractions.ts, trails.ts, wineries.ts."
})
```

### Step 4.2 — Content expansion ideas

```
mcp_task({
  subagent_type: "content-polish",
  prompt: "Content expansion for Cyprus Winter. Propose new indexable pages. Evaluate: region hubs, 'Best X in Cyprus winter' pillars, monthly guides, trail conditions. For each: primary keyword, suggested route, data sources, complexity. Output prioritized roadmap."
})
```

---

## Phase 5: Internal Linking & Conversion

**Goal:** Link structure and engagement signals.  
**Subagents:** `explore`, `ux-polish`  
**Deliverable:** Internal link map + UX recommendations

### Step 5.1 — Internal linking audit

```
mcp_task({
  subagent_type: "explore",
  prompt: "Internal linking strategy for Cyprus Winter. Identify hub pages (discover, trails, regions); map spoke pages; find orphans; suggest anchor text and new hub pages. Output link map with file paths.",
  readonly: true
})
```

### Step 5.2 — Conversion & engagement

```
mcp_task({
  subagent_type: "ux-polish",
  prompt: "Engagement optimization for Cyprus Winter. Review for dwell time, bounce, pogo-sticking: above-the-fold content vs search intent; CTAs and internal links; mobile experience; loading/empty/error states. Output top 5 UX changes that support SEO."
})
```

---

## Quick Start (Phase 1 only)

To start executing Phase 1 right away, run these in order:

1. **Page inventory** — `mcp_task` with `subagent_type: "explore"` and the Step 1.1 prompt above.
2. **Content gaps** — `mcp_task` with `subagent_type: "explore"` and the Step 1.2 prompt above.
3. **Consolidate** — `mcp_task` with `subagent_type: "audit-explore"` and the Step 1.3 prompt above.
4. **Document** — Save or merge outputs into `docs/SEO_REVIEW_PHASE1_GAPS.md`.
