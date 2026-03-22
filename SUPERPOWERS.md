# Superpowers — Plugin & Feature Reference

This guide explains every plugin and built-in superpower in the app and how to activate each one.

---

## 1. Sentry — Error Monitoring & Tracing

**Package:** `@sentry/nextjs` v10
**Files:** `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts`, `src/lib/sentry-redact.ts`

### Activation

```bash
# .env.local
SENTRY_DSN=https://xxx@oxx.ingest.sentry.io/yyy
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=sntrys_...   # CI only — needed for source-map uploads
```

### What it does

- Captures exceptions and performance traces in **browser**, **Node.js**, and **Edge** runtimes automatically
- Proxies Sentry requests through `/monitoring` to bypass ad-blockers
- Uploads source maps at build time, then deletes them from the CDN bundle
- Annotates React components in error reports (`reactComponentAnnotation`)
- Strips `Authorization`, `Cookie`, `Set-Cookie` headers before sending events (`src/lib/sentry-redact.ts`)
- Traces sampled at 10 % in production, 100 % in development

### Manual usage

```ts
import * as Sentry from "@sentry/nextjs";

Sentry.captureException(error);
Sentry.captureMessage("something happened");
Sentry.setUser({ id: userId });        // associate errors with a user
Sentry.addBreadcrumb({ message: "…" }); // add context to the next event
```

---

## 2. Serwist PWA — Offline Caching

**Package:** `@serwist/next`, `@serwist/sw`
**Files:** `src/app/sw.ts`, `src/app/serwist/index.tsx`

### Activation

Enabled automatically in **production builds** (`npm run build && npm start`).
Disabled in dev by default to keep reloads fast.

The `SerwistProvider` is already rendered in `[locale]/layout.tsx` — nothing to add.

### What it does

- Generates `public/sw.js` from `src/app/sw.ts` at build time
- Precaches all Next.js pages and static assets (`__SW_MANIFEST`)
- Runtime caching via `defaultCache` (stale-while-revalidate for most routes)
- `skipWaiting + clientsClaim` → new service worker activates immediately on deploy
- `navigationPreload` → navigation and SW boot happen in parallel (faster page loads)

### Force-enable in dev (for testing)

```ts
// next.config.ts — revert when done
const withPWA = withSerwist({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: false, // ← temporarily
});
```

---

## 3. Push Notifications

**Packages:** `web-push`
**Files:** `src/components/PushOptIn.tsx`, `src/components/WeatherPushOptIn.tsx`, `src/lib/push.ts`, `src/lib/push-subscriptions.ts`, `src/app/api/push/`

### Activation

```bash
# Generate VAPID keys once and save them:
npx web-push generate-vapid-keys

# .env.local
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BA...   # safe to expose to browser
VAPID_PRIVATE_KEY=xx...              # server-side only
VAPID_MAILTO=mailto:you@example.com
CRON_SECRET=any-random-secret
```

### Two opt-in flows

| Component | Notification | Sent by |
|---|---|---|
| `PushOptIn` | Trip countdown (1–3 days before trip starts) | `POST /api/cron/daily` |
| `WeatherPushOptIn` | Weather digest (coast + Troodos temps) | `POST /api/cron/weather-digest` |

### Triggering cron jobs

```bash
# Manually (replace $CRON_SECRET and $HOST):
curl -X POST https://$HOST/api/cron/daily \
  -H "Authorization: Bearer $CRON_SECRET"

curl -X POST https://$HOST/api/cron/weather-digest \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Vercel scheduled cron (`vercel.json`)

```json
{
  "crons": [
    { "path": "/api/cron/daily",          "schedule": "0 7 * * *"       },
    { "path": "/api/cron/weather-digest", "schedule": "0 8,12,17 * * *" }
  ]
}
```

### Sending a custom push (server-side)

```ts
import { sendPush } from "@/lib/push";

await sendPush(subscription, {
  title: "Hello",
  body:  "Your trip starts tomorrow!",
  url:   "/plan",
});
```

---

## 4. Bundle Analyzer

**Package:** `@next/bundle-analyzer`

### Activation

```bash
ANALYZE=true npm run build
```

Opens an interactive treemap of the **client** bundle in your browser.
Use it to spot oversized dependencies and find code-splitting opportunities.

---

## 5. Internationalization (next-intl)

**Package:** `next-intl`
**Files:** `src/i18n/routing.ts`, `src/i18n/request.ts`, `messages/`

### Current locales

Defined in `src/i18n/routing.ts`. Locale-prefixed routes are handled by the middleware and `[locale]/layout.tsx`.

### Adding a new locale

1. Add the locale code to the `locales` array in `src/i18n/routing.ts`
2. Create `messages/<locale>.json` with translated strings (copy `messages/en.json` as a starting point)
3. The middleware, layout, and all `useTranslations()` calls pick it up automatically

### Using translations in components

```ts
import { useTranslations } from "next-intl";

const t = useTranslations("namespace");
return <p>{t("key")}</p>;
```

---

## Quick Reference

| Superpower | Env vars required | Opt-in |
|---|---|---|
| Sentry errors & traces | `SENTRY_DSN` | Auto on non-dev |
| Sentry source maps in CI | `SENTRY_AUTH_TOKEN` + `CI=true` | Auto in CI |
| PWA offline caching | — | Auto in production |
| Push notifications | `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_MAILTO`, `CRON_SECRET` | User opt-in via components |
| Bundle analyzer | — | `ANALYZE=true npm run build` |
| i18n extra locale | — | Add to `routing.ts` + `messages/` |
