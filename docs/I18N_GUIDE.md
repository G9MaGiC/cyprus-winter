## i18n & Localization Guide

This project uses **Next.js 16** with **next-intl** and JSON message catalogs per locale.

### 1. Message catalogs

- Runtime source of truth: `messages/{locale}.json`
- All locales must share the **same key shape**.
- Namespaces used today include:
  - `common`, `home`, `discover`, `discoverPage`, `trails`, `plan`, `bookings`, `account`, `search`, `events`, `meta`, `onboarding`, etc.
- CI enforces consistency:
  - `npm run i18n:validate`
    - Fails if any locale is missing keys, has extra keys, or has empty string values vs `en`.
  - `npm run i18n:coverage`
    - Fails if any key used in code is missing from `messages/en.json`; reports keys in messages not referenced in `src` (use `--strict` to fail on unused keys).
- Optional automation:
  - `npm run i18n:extract` — extracts user-facing strings from data, lib, TSX into `scripts/i18n/strings.json`.
  - `npm run i18n:scan` — scans `src` for likely hardcoded strings (literal `alt`, `aria-label`, `title`, `placeholder`, and JSX text) and suggests keys; use `--fail` to exit 1 if any found (useful once the codebase is fully localized).
  - `npm run i18n:check` — runs both validate and coverage.

### 2. Getting translations

**Server components**

- Use `next-intl/server`:

```ts
import { getTranslations } from "next-intl/server";

const t = await getTranslations({ locale, namespace: "plan" });
const title = t("pageTitle");
```

**Client components**

- Use `next-intl` hooks:

```ts
import { useTranslations, useLocale } from "next-intl";

const tPlan = useTranslations("plan");
const locale = useLocale();

const title = tPlan("pageTitle");
```

- Prefer **existing keys** before adding new ones (e.g. `home.aria.plan`, `common.planYourTrip`, `common.addToPlan`, `nav.*`).

### 3. Locale-aware formatting helpers

Central helpers live in `src/lib/format.ts` and should be used instead of ad‑hoc `toLocale*` calls.

#### Dates

```ts
import { formatDate } from "@/lib/format";

// dateStr can be ISO or YYYY-MM-DD
formatDate(dateStr, locale);
```

- Internally uses `Intl.DateTimeFormat(locale, { weekday, day, month, year })`.
- Handles `YYYY-MM-DD` safely to avoid UTC drift.

#### Relative time

```ts
import { formatReportedAgo } from "@/lib/format";

formatReportedAgo(isoTimestamp, locale);
```

- Uses `Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "narrow" })`.
- Falls back to a short date for older values.

#### Numbers & currency

Prefer `Intl.NumberFormat` over `num.toLocaleString()` or `toFixed()`:

```ts
const number = new Intl.NumberFormat(locale);
const currency = new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" });

number.format(count);
currency.format(amount);
```

### 4. Plurals (including Polish)

Use **ICU MessageFormat** in `messages/*.json` instead of inline ternaries.

Example (`common.peopleCount`):

```jsonc
// messages/en.json
"peopleCount": "{count, plural, one {# person} other {# people}}"
```

```jsonc
// messages/pl.json
"peopleCount": "{count, plural, one {# osoba} few {# osoby} many {# osób} other {# osoby}}"
```

Usage:

```ts
const tCommon = useTranslations("common");
tCommon("peopleCount", { count: partySize });
```

Trip countdown examples (`plan.daysUntilBanner`, `plan.tripReminderBanner`) follow the same pattern for `days`.

### 5. Hardcoded strings & aria/alt

New user‑visible copy **must not** be hardcoded in components.

Instead:

- Add keys under a relevant namespace:
  - `account.*` for account page copy
  - `discoverPage.hero.*` and `discoverPage.search.*` for Discover hero/search
  - `plan.*` for plan page CTA/banners
  - `api.*` for API error messages that reach users
- Use translation functions rather than string concatenation:

```tsx
// Good
const tCommon = useTranslations("common");
<span>{tCommon("backTo", { label })}</span>;

// Avoid
<span>{`Back to ${label}`}</span>;
```

For aria labels and alt text:

- Put them under a dedicated sub‑namespace (e.g. `home.aria.plan`, `discoverPage.hero.imageAlt`).
- Reference via `t("home.aria.plan")` etc.

### 6. RTL & bidi readiness

The app is currently LTR‑only (`en`, `de`, `el`, `pl`), but is wired for future RTL locales.

- Direction is computed from locale in `src/lib/localize.ts`:

```ts
export function getLocaleDir(locale: string): "ltr" | "rtl" {
  const base = locale.split("-")[0]?.toLowerCase();
  return base && ["ar", "he", "fa", "ur"].includes(base) ? "rtl" : "ltr";
}
```

- `src/app/layout.tsx` applies:

```tsx
const dir = getLocaleDir(locale);
<html lang={locale} dir={dir}>
  …
</html>
```

- CSS helpers in `src/app/globals.css`:

```css
[dir="rtl"] .rtl-flip {
  transform: scaleX(-1);
}

[dir="rtl"] .breadcrumb-ol {
  flex-direction: row-reverse;
}
```

Usage examples:

- Wrap chevron icons with `className="rtl-flip"` (e.g. in back buttons).
- Give breadcrumbs’ `<ol>` the `breadcrumb-ol` class so order flips automatically.
- Wrap dynamic labels in `<bdi>` when they may contain mixed scripts:

```tsx
<span className="truncate max-w-full">
  <bdi>{label}</bdi>
</span>
```

### 7. Extraction pipeline (`scripts/i18n/extract.ts`)

The extractor is a **helper**, not a runtime source of messages.

- Outputs `scripts/i18n/strings.json` for translators/content audits.
- Collects strings from:
  - `src/data` (places, trails, events, etc.)
  - select `lib` configs (`nav-links`, discovery journeys, etc.)
  - TSX files under `src/app` and `src/components`.
- Keys are deterministic:
  - `ui.<relative_path>.attr.<hash>` for attributes (`alt`, `aria-label`, `title`, `placeholder`)
  - `ui.<relative_path>.text.<hash>` for inline text nodes

Run:

```bash
npm run i18n:extract
```

### 8. Commands cheat sheet

- **Validate catalogs**: `npm run i18n:validate`
- **Editorial map drift (fr/he/ro)**: `npm run i18n:editorial-drift`
- **Extract candidate strings**: `npm run i18n:extract`
- **Typecheck**: `npm run typecheck`
- **Tests**: `npm test`
- **Build**: `npm run build`

If you add new locales:

1. Add them to routing and `SupportedLocale` in `src/lib/localize.ts`.
2. Create `messages/{locale}.json` matching the `en` key shape.
3. Run `npm run i18n:validate` and fix any reported mismatches.

### 9. Beta locales (fr / he / ro)

Chrome, editorial quality, and draft legal pages are shipped (PRs #179–#183). Remaining EN-identical keys: **[BETA_LOCALE_EN_HOLDOUTS.md](./BETA_LOCALE_EN_HOLDOUTS.md)**. To remove the switcher beta badge after lawyer review: **[BETA_LOCALE_GRADUATION.md](./BETA_LOCALE_GRADUATION.md)**.

```bash
node scripts/i18n/patch-all-chrome-batches.mjs
node scripts/i18n/patch-beta-locale-editorial-quality.mjs
node scripts/i18n/patch-beta-locale-legal.mjs
npm run i18n:editorial-drift
npm run i18n:beta-readiness
```

### 10. Tier-1 locales (de / el / pl)

Book detail SEO meta and hub chrome patches for core winter markets:

```bash
node scripts/i18n/patch-tier1-book-meta.mjs
node scripts/i18n/patch-tier1-hub-chrome.mjs
node scripts/i18n/patch-tier1-chrome-polish.mjs
```

