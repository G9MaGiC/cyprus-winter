# PRE-SEED/0526 — in-repo annex kit

**Status:** Draft working papers for IRIS. **Not submitted.**  
**Deadline:** 11 September 2026, 13:00 (Cyprus). Greek call text wins if English diverges.  
**Host placeholder:** `[HOST ORGANISATION — legal name TBD]`

This folder is the product-side pack. Paste into the **unmodified** RIF Part B template from [IRIS Call Documents](https://iris.research.org.cy). Do not upload these markdown files as the official template.

## What this agent cannot do

- Register the Host Organisation on IRIS
- Confirm startup definition / no prior PRE-SEED or SEED as HO
- Write EUROPASS CVs or name a 15% co-finance bank account
- Set Vercel production secrets or prove live `productionReady: true`

Confirm eligibility with RIF (`callsupport@research.org.cy`, 22 205000) and a Cyprus grant advisor.

## File map

| File | Annex use |
|------|-----------|
| `PART_B.md` | Copy into official Part B (≤20 pages). Delete placeholder brackets. |
| `DNSH.md` | Compatibility gate paragraph |
| `COFINANCE.md` | 15% own contribution note |
| `ANNEX_II.md` | Captions for wireframe PDF |
| `ANNEX_II.pdf` | IRIS upload: captions + PNGs (`npm run grant:annex-pdf`) |
| `wireframes/*.png` | Screenshots labelled as prototype wireframes (desktop 1280 + 390px) |
| `PRODUCTION_HEALTH.md` | Live public `/api/health` capture — currently `productionReady: false` |
| `production-health-public.json` | Machine-readable public health slice (no secrets) |
| `G2_PARTNER_PORTAL_SPEC.md` | Months 0–6 workplan; thin `/partner` MVP is in code (in-memory overlay) |
| `CV_PLACEHOLDER.md` | Who must file CVs — no invented people |

## IRIS submit checklist

1. [ ] `[HOST ORGANISATION — legal name TBD]` exists (or natural-person team will incorporate before contract)
2. [ ] Startup tests in RESTART work programme: small, unlisted, typically ≤5 years, no takeover, no distributed profits, not formed by merger
3. [ ] No prior PRE-SEED or SEED as Host Organisation
4. [ ] Coordinator + Cyprus orgs registered on [IRIS](https://iris.research.org.cy)
5. [ ] Part A (online budget) — indicative numbers in `PART_B.md` are **not** the legal budget
6. [ ] Part B PDF from **official template**, ≤20 pages, no template edits
7. [ ] Annex I: EUROPASS CVs, ≤5 pages each
8. [ ] Annex II: wireframe PDF from `wireframes/` + `ANNEX_II.md` captions
9. [ ] DNSH paragraph from `DNSH.md`
10. [ ] 15% co-finance source named (`COFINANCE.md`)
11. [ ] Optional partner ≤20% experimental development only
12. [ ] Submit on IRIS **before 11 September 2026, 13:00**
13. [ ] Keep local PDF copies of everything uploaded

## Recapture wireframes

```bash
npm run grant:wireframes
# subset (e.g. after cycling image map):
GRANT_SHOTS=cycling,discover-cycling npm run grant:wireframes
# practical filters must wait on place-card titles (not the chip label):
GRANT_SHOTS=discover,discover-accessible,discover-family npm run grant:wireframes
# or from the live prototype:
GRANT_BASE_URL=https://cyprus-winter.vercel.app npm run grant:wireframes

npm run grant:health
npm run grant:annex-pdf
```

Requires the app on `http://localhost:3000` (or `GRANT_BASE_URL`). Health recapture writes `production-health-public.json` and will not invent `productionReady: true`.
