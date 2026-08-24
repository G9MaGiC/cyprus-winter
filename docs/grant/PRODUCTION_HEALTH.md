# G1 — live production health evidence

**Status:** Public JSON captured. **`productionReady` is false.** Do not paste a fabricated `true` into IRIS.  
**Captured:** 24 August 2026 against `https://cyprus-winter.vercel.app/api/health`  
**`cypruswinter.com`:** did not resolve from this agent environment (DNS). Recapture against the custom domain once DNS is live.

Public body (also in `production-health-public.json`):

```json
{
  "ok": false,
  "message": "Unavailable",
  "productionReady": false
}
```

HTTP status was **503**. That matches the health route when required production env is missing (Upstash Redis + Supabase). Pages such as `/cycling` and `/wine-routes/krasochoria` still returned **200** on the same host.

## Recapture

```bash
npm run grant:health          # refresh docs/grant/production-health-public.json
npm run health:production     # exit 0 only when live productionReady is true
```

Authorized annex dump (checks only — no hints) needs `HEALTH_SECRET` on Vercel, then:

```bash
curl -sS "https://cyprus-winter.vercel.app/api/health" \
  -H "Authorization: Bearer ${HEALTH_SECRET}" \
  | jq '{ ok, productionReady, productionChecks }'
```

Do not commit the bearer token. Do not include `hint` fields if a detailed dump leaks them (the public sanitizer drops those keys).

## Ops still required

Set on Vercel Production: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `HEALTH_SECRET`. See `docs/LAUNCH_CHECKLIST.md`.
