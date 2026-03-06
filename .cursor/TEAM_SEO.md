# Cyprus Winter — Top SEO Team

A team of subagents focused on search optimization for Cyprus Winter. Use for meta tags, headings, keywords, alt text, structured data, and discoverability audits.

**Reference:** `.cursor/agents/seo-copywriter.md`, `.cursor/UX_PERSONA.md`, `src/app/**/page.tsx`, `src/data/`  
**Review plan:** `docs/SEO_REVIEW_PLAN.md` — phased runbook for full project review

---

## Team Roster

| Role | Subagent Type | Focus |
|------|---------------|-------|
| **SEO copywriter** | `seo-copywriter` (agent) | Meta tags, titles, descriptions, heading hierarchy, keyword strategy |
| **Content & consistency** | `content-polish` | Tone alignment, micro-copy, Cyprus accuracy, snippet quality |
| **Technical audit** | `audit-explore` | Structured data, canonical URLs, sitemap, broken links, duplicate content |
| **Exploration** | `explore` | Locate metadata sources, page coverage, alt text gaps |

---

## Invocation Prompts

### 1. SEO Copywriter (seo-copywriter agent)

Use when: optimizing meta tags, headings, or keyword placement.

```
Use the agent at .cursor/agents/seo-copywriter.md

Audit and improve SEO for Cyprus Winter. Focus on:
- Meta titles and descriptions (layout, discover, trails, team, secrets, search)
- Heading hierarchy (h1, h2, h3) across pages
- Keyword usage (Cyprus winter, trails, wineries, Troodos)
- Alt text for attraction and trail images
- Attraction/trail snippet descriptions (first 155 chars)

Provide before/after copy and file paths.
```

### 2. Full Page SEO Audit

```
You are the SEO team for Cyprus Winter (Next.js tourism app).
Perform a full SEO audit for [page or scope]:

Meta & Open Graph:
- Title: <60 chars, keyword-rich, differentiated per page
- Description: 150–160 chars, benefit-led, primary keyword
- OG/twitter tags consistent with layout defaults

Headings:
- Single h1 per page, keyword-rich
- h2 → h3 logical, scannable structure
- No keyword stuffing; natural tone

Keywords:
- Primary: Cyprus winter, winter in Cyprus, Cyprus trails, Cyprus wineries, Troodos hiking
- Secondary: Nissi Beach winter, Paphos mosaics, Lefkara, Commandaria, Kourion, Ayia Napa winter

Alt text:
- Descriptive, concise, include location when relevant
- No "image of" / "picture of"

Output: Structured report with file paths, before/after samples, priority list.
```

### 3. Technical SEO Audit

```
You are the technical SEO auditor for Cyprus Winter.
Audit:

- Metadata exports in src/app/**/page.tsx and generateMetadata
- Layout metadata in src/app/layout.tsx
- Sitemap and robots.txt presence
- Structured data (JSON-LD) opportunities
- Canonical URL handling
- Internal link structure and broken links

Output: Findings with severity, file paths, and recommended changes.
```

### 4. Keyword & Content Gaps

```
Explore the Cyprus Winter codebase for SEO content gaps.
Check:
- Which pages have no custom title or description?
- Which attraction/trail pages lack good snippet text?
- Missing alt text on images
- Long-tail keyword opportunities (e.g. "best beaches Cyprus winter", "Troodos trail conditions December")

Reference: src/data/attractions.ts, trails.ts, wineries.ts
Output: Gap list with file paths and suggested copy.
```

---

## SEO Checklist

| Area | Status | Notes |
|------|--------|-------|
| Layout metadata | | Default title/description in layout.tsx |
| Page metadata | | Per-route title, description in page.tsx |
| h1 per page | | Single, keyword-rich |
| Heading hierarchy | | h2 → h3 logical |
| Alt text | | All images descriptive |
| OG/twitter | | Consistent with layout |
| Attraction snippets | | First 150–160 chars optimized |
| Trail snippets | | First 150–160 chars optimized |
| Keyword coverage | | Primary/secondary in key pages |
| Sitemap | | next-sitemap or equivalent |
| robots.txt | | Crawl directives |

---

## Workflow

| Step | Role | Action |
|------|------|--------|
| 1 | SEO copywriter | Audit meta, headings, keywords, alt text |
| 2 | Content polish | Align tone, refine snippets, Cyprus accuracy |
| 3 | Technical audit | Check structured data, sitemap, canonical |
| 4 | Explore | Find metadata/alt gaps, coverage |

---

## MCP Invocation (mcp_task)

```javascript
// Full SEO audit via seo-copywriter agent
// (Use agent prompt; seo-copywriter is an agent, not a subagent_type)

// Technical SEO audit
mcp_task({ subagent_type: "audit-explore", prompt: "Technical SEO audit for Cyprus Winter: metadata, sitemap, structured data, canonical URLs..." })

// Content gaps
mcp_task({ subagent_type: "explore", prompt: "Find SEO content gaps in Cyprus Winter: missing metadata, alt text, snippet optimization...", readonly: true })

// Content polish
mcp_task({ subagent_type: "content-polish", prompt: "SEO content polish for Cyprus Winter: meta copy, heading tone, snippet quality..." })
```

---

## SEO Roadmap

See **docs/SEO_ROADMAP.md** for P0 (fast traffic) and P1 (medium-term) page backlog.

## Key Files

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Default metadata, OG defaults |
| `src/app/**/page.tsx` | Page-level metadata, generateMetadata |
| `src/app/discover/[id]/page.tsx` | Dynamic attraction metadata |
| `src/app/weather/page.tsx` | Weather by month (P0) |
| `src/app/beaches/page.tsx` | Beaches index (P0) |
| `src/app/wineries/page.tsx` | Wineries index (P0) |
| `src/app/guides/troodos-december/page.tsx` | Troodos December guide (P0) |
| `src/app/regions/troodos/page.tsx` | Troodos region hub (P0) |
| `src/data/attractions.ts` | Attraction content, snippet source |
| `src/data/trails.ts` | Trail content, snippet source |
| `src/data/wineries.ts` | Winery content |
| `.cursor/agents/seo-copywriter.md` | SEO agent definition |
