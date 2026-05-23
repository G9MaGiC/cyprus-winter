# Cyprus Winter — Technical Runbook

**Version:** 1.0  
**Last updated:** March 2026  
**Audience:** DevOps, on-call, CTO

Runbooks and fallbacks for technical risks: AI dependency (Moonshot), Supabase config, build directory ownership, and cron monitoring.

---

## 1. AI Dependency (AI Gateway, xAI, Groq, Ollama, Moonshot, OpenAI)

### Risk

The chat assistant depends on an AI provider. If no provider is configured (missing key/URL), invalid, rate-limited, or the provider is down, AI chat fails.

Supported providers (priority order): **Vercel AI Gateway** (single key), **xAI** (grok-3-mini), **Groq** (llama-3.1-8b-instant), **Ollama** (local/self-hosted), **Moonshot** (moonshot-v1-8k), **OpenAI** (gpt-4o-mini).

### Current Behavior

| Condition | Response |
|-----------|----------|
| No provider configured | 503, message: "Add AI_GATEWAY_API_KEY, XAI_API_KEY, GROQ_API_KEY, OLLAMA_BASE_URL, MOONSHOT_API_KEY, or OPENAI_API_KEY to your .env.local" |
| Rate limit (20 req/min) | 429, message: "Please wait a moment before trying again" |
| Provider error | 500, message: error.message (no stack) |
| Quota exceeded | User sees "We've hit a usage limit for now" |

### Required env var (one of)

```
AI_GATEWAY_API_KEY=<your-key>       # Vercel AI Gateway (recommended if available)
AI_GATEWAY_MODEL=openai/gpt-4o-mini # Optional; default openai/gpt-4o-mini
XAI_API_KEY=<your-key>            # xAI Grok at console.x.ai
GROQ_API_KEY=<your-key>           # Free at console.groq.com, Llama models
OLLAMA_BASE_URL=http://localhost:11434/v1   # For local/self-hosted Ollama
OLLAMA_MODEL=llama3.2             # Optional; default llama3.2. Run: ollama pull <model>
OLLAMA_TIMEOUT_MS=60000           # Optional; default 60000 (Ollama can be slower)
MOONSHOT_API_KEY=<your-key>
OPENAI_API_KEY=sk-...
```

**Ollama:** In development, when `OLLAMA_BASE_URL` is set, Ollama is tried first. Recommended models: llama3.2, llama3.1, qwen2.5:7b, mistral. Use `ollama pull <model>` before setting OLLAMA_MODEL.

### Health Check

```bash
curl -s https://<your-domain>/api/health | jq '.ai'
# true = configured, false = not configured
```

### Runbook: AI Chat 503 or Down

1. **Verify a provider is configured**
   ```bash
   # In deployment env (Vercel, Docker, etc.)
   echo $XAI_API_KEY | head -c 8
   echo $GROQ_API_KEY | head -c 8
   echo $OLLAMA_BASE_URL
   echo $MOONSHOT_API_KEY | head -c 8
   echo $OPENAI_API_KEY | head -c 8
   ```
   At least one must be set. If all empty: add `GROQ_API_KEY` (free at [console.groq.com](https://console.groq.com)) or another provider to env and redeploy.

2. **Verify provider status**
   - xAI Grok: [console.x.ai](https://console.x.ai)
   - Groq: [console.groq.com/docs](https://console.groq.com/docs)
   - Ollama: ensure the server at `OLLAMA_BASE_URL` is running; if "model not found", run `ollama pull <model>`
   - Moonshot: [Moonshot status](https://status.moonshot.ai) or provider docs
   - If outage: no code change needed. App degrades gracefully.

3. **Quota / rate limit**
   - Chat returns 429 or quota message.
   - User can still use Discover, Trails, Plan, Bookings.
   - Consider increasing provider quota or rate-limit threshold in `src/lib/rate-limit.ts`.

### Fallback

The app does **not** require AI. If the provider is down:
- Chat button remains; users get a friendly error.
- All other features (discover, trails, plan, bookings) work.
- Consider hiding or disabling the AI button in future if AI is consistently unavailable (product decision).

---

## 2. Supabase Env Config

### Risk

Bookings, trail reports, and conversion tracking use Supabase. If env vars are missing or wrong, persistence fails.

### Required Env Vars

| Variable | Purpose | Required For |
|----------|---------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Bookings, trail reports, tracking |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (client) | Auth (login, signup, OAuth) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only) | Write access to tables |

**Optional — OAuth (login/register):** Set to `"true"` to show social sign-in buttons. Requires Supabase Auth providers configured in the dashboard.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED` | Show Google sign-in when Supabase Google provider is configured |
| `NEXT_PUBLIC_AUTH_APPLE_ENABLED` | Show Apple sign-in when Supabase Apple provider is configured |

### Current Fallback

- If either var is missing: `hasSupabase()` returns false.
- Bookings and reports use in-memory fallback (data lost on restart).
- Health endpoint returns `storage: "memory"` and `supabase: "not configured"`.

### Health Check

```bash
curl -s https://<your-domain>/api/health
```

Example response:

```json
{
  "ok": true,
  "ai": true,
  "storage": "supabase",
  "email": true,
  "supabase": "ok"
}
```

| Field | Values | Meaning |
|-------|--------|---------|
| `ok` | true/false | Overall health; 503 if false |
| `storage` | `supabase` \| `memory` | Where data is stored |
| `supabase` | `ok` \| `error` \| `not configured` | DB reachability |

### Runbook: Supabase Unreachable

1. **Check env vars**
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set.
   - Service role key must have RLS bypass; do not expose client-side.

2. **Verify connectivity**
   ```bash
   curl -s "https://<project-ref>.supabase.co/rest/v1/bookings?limit=1" \
     -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
     -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
   ```

3. **If Supabase is down**
   - App keeps running; new bookings/reports go to memory (lost on restart).
   - Logs: "Supabase unreachable" or storage/DB errors.
   - No code change; restore Supabase or wait for recovery.

4. **Migration / schema**
   - Migrations live in `supabase/migrations/`.
   - Run via `supabase db push` or dashboard SQL.

---

## 3. Build Directory Ownership (root-owned .next / dist/next)

### Risk

If `npm run build` (or equivalent) is run with `sudo`, or in Docker as root, the build output (`.next` or `dist/next`) can become root-owned. Subsequent builds by a normal user then fail with `EACCES`.

### Current Setup

- Next.js outputs to `dist/next` (see `next.config.ts` `distDir`).
- Pre-build script `scripts/check-build-dir.mjs` checks that `dist/next` is writable.

### Symptoms

- `npm run build` fails before Next compiles.
- Error: `.next is not writable (likely root-owned)` (message may still say `.next`; the script checks `dist/next`).
- Fix instructions printed in `scripts/check-build-dir.mjs` (chown + rm + build).

### Runbook: Build Fails Due to Ownership

1. **Fix ownership and remove old output**
   ```bash
   cd /path/to/cyprus-winter
   sudo chown -R $(whoami) dist .next .next-build 2>/dev/null
   rm -rf dist .next .next-build
   npm run build
   ```

2. **Or, after fixing ownership:** `npm run build:clean` (removes output dirs and rebuilds).

3. **Prevention**
   - Do **not** run `npm run build` with `sudo`.
   - In Docker: run build as non-root user, or ensure output dir is writable by that user.
   - In CI: run as regular user; avoid `sudo npm` / `sudo npx`.

### Alternate: Use Different Output Dir

If you can’t fix ownership (e.g. shared host):

- `next.config.ts` already uses `distDir: "dist/next"`.
- If both `.next` and `dist/next` are root-owned, use a new dir:
  1. Set `distDir: "build/next"` (or another path) in `next.config.ts`.
  2. Update `scripts/check-build-dir.mjs` to check that path.
  3. Add the new dir to `.gitignore`.

---

## 4. Cron Jobs (Monitoring & Alerting)

### Risk

Cron jobs (`/api/cron/daily`, `/api/cron/weather-digest`) run on a schedule. If they fail, there is no built-in alerting. Trail summary and push notifications can go stale.

### Configured Crons (Vercel)

| Path | Schedule (UTC) | Purpose |
|------|----------------|---------|
| `/api/cron/daily` | 06:00 daily | Refresh trail summary cache; send trip countdown push notifications |
| `/api/cron/weather-digest` | 12:00 daily | Send weather digest push notifications |

### Authentication

Both routes require `Authorization: Bearer <CRON_SECRET>`. Vercel injects this automatically. For manual runs:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://<your-domain>/api/cron/daily
curl -H "Authorization: Bearer $CRON_SECRET" https://<your-domain>/api/cron/weather-digest
```

### Monitoring Options

1. **Vercel dashboard**  
   Project → Logs / Functions. Filter by `/api/cron/*`. Check for 500s or timeouts.

2. **External cron monitor**  
   Use a service (e.g. [cron-job.org](https://cron-job.org), [Better Uptime](https://betteruptime.com), [Vercel Cron Monitoring](https://vercel.com/docs/cron-jobs/monitoring)) to:
   - Hit `GET /api/cron/daily` and `GET /api/cron/weather-digest` with `Authorization: Bearer <CRON_SECRET>`
   - Expect 200; alert on 4xx/5xx or timeout
   - Run slightly after Vercel’s schedule (e.g. 06:05, 12:05) to confirm completion

3. **Log aggregation**  
   If using Datadog, Sentry, or similar: create alerts on errors from `/api/cron/*` paths.

### Runbook: Cron Job Failing

1. **Check Vercel logs**  
   Inspect the failing cron invocation (error message, stack).

2. **Common causes**
   - Missing `CRON_SECRET` → 401
   - Weather API timeout (daily, weather-digest) → 500
   - Trail summary fetch failure (daily) → 500
   - Push service (web-push) error → partial failure; some pushes may still succeed

3. **Manual retry**
   ```bash
   curl -v -H "Authorization: Bearer $CRON_SECRET" https://<your-domain>/api/cron/daily
   ```

4. **Impact**
   - Trail summary: app falls back to stale or empty data; Right Now and trail pages still work.
   - Push notifications: users miss that run; next run will retry.

### Recommended: Set Up Basic Alerting

Before launch, configure at least one of:

- Vercel → Project Settings → Notifications (deployment failures)
- External cron monitor hitting the cron URLs and alerting on non-2xx
- Log-based alerting (e.g. Sentry) for 500s from `/api/cron/*`

---

## 5. Capacitor Android App (Production Stance)

### Risk

The Android app loads the web app from a remote URL (`server.url` in `capacitor.config.ts`). By default this is `https://cyprus-winter.vercel.app`. Capacitor docs note this is **not intended for production**; live-update or bundled content is preferred long term.

### Current Setup

- **URL:** `CAPACITOR_SERVER_URL` env or fallback `https://cyprus-winter.vercel.app`
- **Error page:** `errorPath: "error.html"` shows when load fails (subject to WebView behavior; not all failure types trigger it)
- **Limitations:** App depends on Vercel uptime and network; cold start when offline may hang; `errorPath` does not reliably cover DNS/TLS failures

### Runbook: App Shows Blank or "Can't Connect"

1. **Check Vercel deployment** — Ensure the site is live at the configured URL.
2. **Check network** — User may be offline; `error.html` will show if WebView invokes it.
3. **Update server URL** — Set `CAPACITOR_SERVER_URL` and run `npm run android:sync` before building.

### Migration Path (Post-Launch)

- Consider bundled web content or [Capawesome Live Updates](https://capawesome.io/cloud/live-updates/) for updates without store releases.
- When switching to production domain, set `CAPACITOR_SERVER_URL=https://cypruswinter.com` (or your domain) and sync.

---

## 6. Production readiness checklist

Before launch, `GET /api/health` should report `productionReady: true` in production (`NODE_ENV=production`):

| Check | Env vars |
|-------|----------|
| **Required** | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| **Required** | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Recommended | `RESEND_API_KEY`, `ADMIN_SECRET`, one AI provider key |

```bash
curl -s https://<your-domain>/api/health | jq '.productionReady, .productionChecks'
```

**Content & data:** Run `npm run data:validate` before merging editorial changes (combineWith, activity catalog, itinerary templates).

**Capacitor (Android):** Remote WebView loads `CAPACITOR_SERVER_URL` (default Vercel). For store releases, pin a production URL, ship `public/error.html`, and plan Live Updates or bundled assets post-launch (see §5).

---

## Quick Reference

| Issue | Check | Fix |
|-------|-------|-----|
| AI 503 | `curl /api/health` → `ai: false` | Add `XAI_API_KEY`, `GROQ_API_KEY`, `OLLAMA_BASE_URL`, `MOONSHOT_API_KEY`, or `OPENAI_API_KEY` |
| Android app blank | Vercel URL reachable? | Check deployment; user may be offline; see §5 |
| Supabase down | `curl /api/health` → `supabase: "error"` | Check URL/key, Supabase status |
| Build EACCES | Pre-build fails on output dir | `sudo chown -R $(whoami) dist .next .next-build 2>/dev/null` then `npm run build:clean` |
| Cron 500 | Vercel logs, external monitor | Check logs; retry manually; see §4 |

---

## Related Docs

- `TECHNICAL.md` — Architecture and tech stack
- `src/app/api/health/route.ts` — Health endpoint implementation
- `src/lib/supabase.ts` — Supabase client and fallback
