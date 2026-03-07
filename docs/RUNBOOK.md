# Cyprus Winter — Technical Runbook

**Version:** 1.0  
**Last updated:** March 2026  
**Audience:** DevOps, on-call, CTO

Runbooks and fallbacks for technical risks: AI dependency (Moonshot), Supabase config, and build directory ownership.

---

## 1. AI Dependency (Groq, Ollama, Moonshot, OpenAI)

### Risk

The chat assistant depends on an AI provider. If no provider is configured (missing key/URL), invalid, rate-limited, or the provider is down, AI chat fails.

Supported providers (priority order): **xAI Grok** (grok-3-mini), **Groq** (free, Llama), **Ollama** (local/self-hosted), **Moonshot** (Kimi), **OpenAI** (gpt-4o-mini).

### Current Behavior

| Condition | Response |
|-----------|----------|
| No provider configured | 503, message: "Add XAI_API_KEY, GROQ_API_KEY, OLLAMA_BASE_URL, MOONSHOT_API_KEY, or OPENAI_API_KEY to your .env.local" |
| Rate limit (20 req/min) | 429, message: "Please wait a moment before trying again" |
| Provider error | 500, message: error.message (no stack) |
| Quota exceeded | User sees "We've hit a usage limit for now" |

### Required Env Var (one of)

```
XAI_API_KEY=<your-key>            # xAI Grok at console.x.ai
GROQ_API_KEY=<your-key>           # Free at console.groq.com, Llama models
OLLAMA_BASE_URL=http://localhost:11434/v1   # For local/self-hosted Ollama
MOONSHOT_API_KEY=<your-key>
OPENAI_API_KEY=sk-...
```

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
   - Ollama: ensure the server at `OLLAMA_BASE_URL` is running
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
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only) | Write access to tables |

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

## Quick Reference

| Issue | Check | Fix |
|-------|-------|-----|
| AI 503 | `curl /api/health` → `ai: false` | Add `XAI_API_KEY`, `GROQ_API_KEY`, `OLLAMA_BASE_URL`, `MOONSHOT_API_KEY`, or `OPENAI_API_KEY` |
| Supabase down | `curl /api/health` → `supabase: "error"` | Check URL/key, Supabase status |
| Build EACCES | Pre-build fails on output dir | `sudo chown -R $(whoami) dist .next .next-build 2>/dev/null` then `npm run build:clean` |

---

## Related Docs

- `TECHNICAL.md` — Architecture and tech stack
- `src/app/api/health/route.ts` — Health endpoint implementation
- `src/lib/supabase.ts` — Supabase client and fallback
