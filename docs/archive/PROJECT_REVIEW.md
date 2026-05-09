**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# Cyprus Winter — Consolidated Project Review

AI subagent reviews from the team (designers and developers). Run subagents via `.cursor/agents/TEAM_AGENTS.md`.

**Status:** Many items resolved as of Mar 2026. See [docs/ROADMAP.md](../ROADMAP.md) for current priorities.

---

## Executive Summary

| Lens | Grade | Top Priority |
|------|-------|--------------|
| **UX** (Lena) | Good | ✅ Plan→Book done; View all days, Clear day added |
| **Design** (James, Kostas) | Good | ✅ Terracotta unified; viewport theme; hero CTAs |
| **Engineering** (Emma, Marcus, Dimitra) | B+ | ✅ XSS fixed; rate limiting; Zod; email lookup |
| **Audit** | — | ✅ Critical items addressed; see resolved list below |

---

## 1. UX Review (Lena Müller — UX Designer)

### Strengths
- Clear flows: discover → detail → book; airport → essentials
- AI entry points: hero, nav, floating button, mobile menu
- Focus states, aria-labels, 44px touch targets
- Empty/loading/error states on bookings, AI chat

### Gaps
1. **Plan → Book disconnect (P0)** — Plan adds wineries but has no "Book tasting" CTA.
2. **AI chat focus** — No focus trap when panel opens; floating button ignores safe-area-inset-bottom.
3. **Touch targets** — Plan day tabs and "Remove" may be under 44px.
4. **Image alt** — `alt=""` on AttractionCard; should be descriptive.

### Top 3 Recommendations
1. Add "Book tasting" for wineries in Plan day list; link to `/book/winery/[id]`.
2. Focus trap in AI panel; `bottom-[max(1.5rem,env(safe-area-inset-bottom))]` for floating button.
3. Increase Plan touch targets: `py-3`, `min-h-[44px]` on day tabs and Remove.

---

## 2. Design Review (James Okonkwo, Kostas Papadopoulos)

### Strengths
- Consistent tokens (terracotta, olive, golden, aegean, charcoal)
- Typography: Fraunces + Plus Jakarta Sans, clear hierarchy
- Cards, CTAs, badges follow shared patterns
- Mediterranean palette and winter copy

### Gaps
1. **Terracotta vs aegean** — AI chat uses aegean; elsewhere terracotta. Links/CTAs mixed.
2. **AttractionCard** — `amber-100/800` instead of design tokens.
3. **viewport.ts** — `themeColor: "#1e293b"` instead of charcoal `#2b2d42`.
4. **Hero CTAs** — Plain white outlines; could use terracotta tint.
5. **Imagery** — Generic Unsplash; not Cyprus-specific.

### Top 3 Recommendations
1. Unify primary: terracotta for all CTAs and links; align AI chat styling.
2. Replace `amber-*` in AttractionCard with `golden` or `terracotta`; update viewport theme color.
3. Add terracotta/golden tint to hero CTAs; consider Cyprus-specific hero image.

---

## 3. Engineering Review (Emma Chen, Marcus Lindqvist, Dimitra Ioannou)

### Strengths
- App Router, server/client split, Next.js Image
- Supabase fallback; optional Resend and Moonshot
- Error boundaries; `notFound()` for invalid IDs
- Clear data flow: static data + Supabase + optional email

### Tech Debt & Risks
1. **XSS in AI chat** — `dangerouslySetInnerHTML` with unsanitized model output.
2. **No rate limiting** — Chat and bookings APIs open to abuse.
3. **Weak validation** — Email, date, partySize, guestName not validated.
4. **localStorage + Supabase** — Duplicate state; merge logic brittle.
5. **AI context** — Large string per request; not cached.

### Top 3 Recommendations
1. Sanitize AI output (DOMPurify or react-markdown); block `javascript:` and `data:` in URLs.
2. Add rate limiting (Upstash/Vercel KV) and Zod validation for bookings.
3. Simplify bookings: prefer Supabase + email lookup; reduce localStorage use.

---

## 4. Audit Findings

### Critical
1. **Unauthenticated booking lookup** — `GET /api/bookings?email=...` returns all bookings for that email.
2. **XSS in AI assistant** — Model output rendered via `dangerouslySetInnerHTML`.
3. **Weak email lookup** — `.ilike("guest_email", email)` matches substrings; `email=@` returns all.

### High
4. HTML injection in Resend email template (unescaped guestName, etc.).
5. No rate limiting on APIs.
6. Missing input validation (Zod or similar).
7. `viewport.ts` theme color hardcoded.

### Medium
8. Attraction `image` field unused; TYPE_IMAGES used instead.
9. `filter=nature` gap in discover.
10. Empty image `alt` on cards and detail.
11. AI context: `wineries.length - 30` vs 20 wineries passed.
12. Resend failures swallowed (`catch(() => {})`).

### Low
13. Trails id/slug mapping undocumented.
14. Chat API stack traces in dev responses.
15. Health endpoint doesn’t check Supabase/Resend.

---

## Prioritized Action List

| # | Action | Status |
|---|--------|--------|
| 1 | Sanitize AI chat output (react-markdown) | ✅ Done |
| 2 | Exact match for email lookup in Supabase | ✅ Done |
| 3 | Add auth or verification for booking lookup | Pending (rate limit + exact match applied) |
| 4 | Add "Book tasting" for wineries in Plan | ✅ Done |
| 5 | Fix AI chat focus trap + floating button safe area | ✅ Done |
| 6 | Add rate limiting for chat and bookings | ✅ Done |
| 7 | Add Zod validation for bookings API | ✅ Done |
| 8 | Unify terracotta/aegean; fix viewport theme color | ✅ Done |
| 9 | Escape email template values | ✅ Done |
| 10 | Descriptive `alt` for attraction images | ✅ Done |
| 11 | filter=nature gap in discover | ✅ Done (maps to beach) |

---

## Invoking Team Subagents

See `.cursor/agents/TEAM_AGENTS.md` for mcp_task examples. Use:

- **ux-polish** for Lena (UX flows, accessibility, mobile)
- **branding-redesign** for James and Kostas (design system, visual identity)
- **senior-software-engineer** for Emma, Marcus, Dimitra (architecture, security, code quality)
- **audit-explore** for gap analysis and security review
