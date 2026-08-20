# Locale-aware PWA Manifest Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Serve a locale-aware Web App Manifest so install name/description/shortcuts/`start_url` match the page locale (P1 from `docs/DEEP_REVIEW_2026-05-29.md` § Localize `public/manifest.json`).

**Architecture:** Do **not** rely on root-only `src/app/manifest.ts` + `getLocale()` alone. `src/proxy.ts` matcher excludes dotted paths (`.*\\..*`), so `/manifest.webmanifest` skips next-intl middleware and would usually fall back to `en`. Encode locale in the manifest URL from layout metadata; build JSON with a shared helper + `localizedPathname`.

**Tech Stack:** Next.js 16 App Router, next-intl (`localePrefix: "as-needed"`), existing `messages/*.json`, `TOKENS` in `src/lib/design-tokens.ts`, `localizedPathname` in `src/lib/seo-locale-urls.ts`.

**Verified current state (main @ 53b60bc includes DR-028):**
- `public/manifest.json` — static EN; `start_url: "/"`, shortcuts `/#right-now`, `/plan`
- `src/app/layout.tsx` + `src/app/[locale]/layout.tsx` — `manifest: "/manifest.json"`
- Deep review P1 item #5: Localize `public/manifest.json`
- No `manifest.*` keys in `messages/` yet (extract script already *expects* them)

---

## 1. Recommended approach

**Prefer: locale-explicit route + metadata link (smallest safe).**

| Option | Verdict |
|--------|---------|
| `src/app/manifest.ts` + `getLocale()` only | **Reject as sole solution** — dotted URL bypasses intl middleware |
| `src/app/manifest.ts` + matcher exception | Possible follow-up; still cookie-fragile on cold fetch |
| Per-locale `generateMetadata` only (no new route) | Cannot localize body of static `public/manifest.json` |
| **`/manifests/[locale]` route + layouts set `manifest`** | **Do this** — locale known at HTML render time |

Pattern:
1. `buildPwaManifest(locale)` helper returns `MetadataRoute.Manifest` (or plain JSON-compatible object).
2. `GET /manifests/[locale]` validates locale via `routing.locales`, returns `Content-Type: application/manifest+json`.
3. Both layouts set `manifest: `/manifests/${locale}`` (root layout must switch static `metadata` → `generateMetadata` using `getLocale()`).
4. Remove `public/manifest.json` after cutover; update SW precache + i18n extract.

Optional later: add `src/app/manifest.ts` that redirects or duplicates default-locale output for tooling — **not required** if metadata links are correct.

---

## 2. Exact files to create/edit

**Create**
- `src/lib/pwa-manifest.ts` — `buildPwaManifest(locale: Locale)`
- `src/lib/pwa-manifest.test.ts` — start_url/shortcuts/lang/dir per locale
- `src/app/manifests/[locale]/route.ts` — GET handler
- `src/app/manifests/[locale]/route.test.ts` — 200 + 404 invalid locale (if API route test pattern exists; else fold into helper tests)

**Edit**
- `src/app/layout.tsx` — `generateMetadata`; `manifest: `/manifests/${locale}``; `appleWebApp.title` from `home.title`
- `src/app/[locale]/layout.tsx` — same `manifest` URL; optional same apple title
- `messages/{en,el,de,pl,ro,fr,he}.json` — add `manifest` namespace (see §3)
- `public/sw.js` — replace `/manifest.json` in `PRECACHE_URLS` with `/manifests/en` (or drop manifest from precache)
- `scripts/i18n/extract.ts` — stop reading `public/manifest.json`; keys live in messages
- `docs/QA_BUGS.md` — one line noting P1 manifest localization in progress/done

**Delete (after cutover)**
- `public/manifest.json`

**Do not touch (this fix)**
- Full offline/Serwist strategy
- `viewport.themeColor` (charcoal) vs manifest `theme_color` (terracotta) alignment — document only

---

## 3. Message keys — reuse vs add

### Reuse (no new copy)

| Manifest field | Key | EN |
|----------------|-----|-----|
| `short_name` | `home.title` | Cyprus Winter |
| Shortcut Plan `name` / `short_name` | `nav.plan` | Plan |
| Shortcut Plan `description` | `plan.aria.yourItinerary` | Your itinerary |
| Shortcut Right now `name` / `short_name` | `home.rightNowNearYou` | Right now near you |
| `appleWebApp.title` | `home.title` | Cyprus Winter |

### Add (move exact strings from current `public/manifest.json` — do not invent)

Namespace `manifest` (matches `scripts/i18n/extract.ts` expectations):

```json
"manifest": {
  "name": "Cyprus Winter — Plan Ahead or Start Exploring",
  "description": "Cyprus winter: trails, villages, heritage, events. Plan your trip or explore when you land. Trail conditions, winery tastings, local secrets.",
  "shortcuts": {
    "rightNowDescription": "What's good near you — weather and location-based suggestions"
  }
}
```

- Seed **en** from `public/manifest.json` verbatim.
- Mirror keys in **el, de, pl, ro, fr, he** (translate properly where editorial exists; beta locales may temporarily keep EN for these three strings if that matches other beta editorial policy — prefer real translations when cheap).
- Do **not** reuse `meta.homeDescription` / `footer.tagline` for `manifest.description` — wording differs; moving the manifest string is the non-inventive path.

---

## 4. `start_url` / shortcuts with `localePrefix: "as-needed"`

Use existing `localizedPathname` from `src/lib/seo-locale-urls.ts` (already tested).

| Locale | `start_url` | Right now | Plan |
|--------|-------------|-----------|------|
| `en` (default) | `/` | `/#right-now` | `/plan` |
| `de` (etc.) | `/de` | `/de#right-now` | `/de/plan` |

Implementation detail:
```ts
start_url: localizedPathname("/", locale),
shortcuts: [
  { url: `${localizedPathname("/", locale)}#right-now`, ... },
  { url: localizedPathname("/plan", locale), ... },
]
```

Also set:
- `lang: locale`
- `dir: locale === "he" ? "rtl" : "ltr"`
- `scope`: prefer localized home (`/` or `/de`) so install stays in that locale tree
- `id`: optional stable per-locale id (e.g. `/?lang=de`) to avoid install collisions — only if install testing shows EN/DE overwrite; otherwise omit (YAGNI)

---

## 5. Tests / acceptance criteria

**Unit**
- [ ] `en` → `start_url === "/"`, plan shortcut `/plan`, hash `/#right-now`
- [ ] `de` → `start_url === "/de"`, plan `/de/plan`, hash `/de#right-now`
- [ ] `he` → `lang === "he"`, `dir === "rtl"`; name/description from `he` messages when provided
- [ ] Invalid locale route → 404
- [ ] Colors: `theme_color === TOKENS.terracotta` (`#c96f52`), `background_color === TOKENS.sand` / `cloud` (`#faf8f5`)
- [ ] Icons remain `/icon-192.png`, `/icon-512.png`

**Acceptance**
- [ ] View-source on `/` and `/de`: `<link rel="manifest" href="/manifests/en">` / `/manifests/de`
- [ ] `GET /manifests/de` JSON: German (or locale) strings; localized URLs
- [ ] `public/manifest.json` gone; no layout still pointing at it
- [ ] `npm run i18n:validate` + `i18n:scan --fail` green
- [ ] `npm run test` + `typecheck` green
- [ ] Manual: Chrome install from `/de` opens `/de` (not bare `/`)

---

## 6. Pitfalls

1. **Middleware + dotted paths** — Why locale must be in the URL; do not “fix” with only `manifest.ts` + `getLocale()`.
2. **Icons** — Keep root-absolute `/icon-*.png` (files exist). Next `MetadataRoute` types `purpose` as `'any' | 'maskable' | 'monochrome'` only — current `"any maskable"` is invalid for the type; emit **two entries** (or one `maskable`) instead of the combined string.
3. **theme_color** — Use `TOKENS.terracotta` (`#c96f52`), not `viewport` charcoal (`#252730`). Brand review already locked terracotta on the manifest; do not “fix” viewport in this PR.
4. **RTL `he`** — Set manifest `dir`/`lang`; HTML already sets `dir` in root layout. Shortcuts/URLs stay LTR path segments (`/he/...`).
5. **SW precache** — Updating `PRECACHE_URLS` avoids caching a deleted `/manifest.json`.
6. **Dual layouts** — Root `(padded)` EN pages and `[locale]` pages both must set the manifest link or EN/localized installs diverge.
7. **Beta locales (`fr`/`he`/`ro`)** — Chrome may be translated while editorial is EN; still ship `lang`/`start_url` correctly even if `manifest.name` temporarily matches EN.

---

## Task checklist

- [ ] Add `manifest` keys to all 7 message files (EN from current JSON)
- [ ] Implement `buildPwaManifest` + unit tests
- [ ] Add `src/app/manifests/[locale]/route.ts`
- [ ] Wire both layouts’ metadata; fix `appleWebApp.title` via `home.title`
- [ ] Delete `public/manifest.json`; update `sw.js` + `extract.ts`
- [ ] Run validate/typecheck/test; log QA note
- [ ] Commit

**Out of scope:** Serwist offline shell, push, Lighthouse PWA score chase, inventing new marketing copy.
