# Licensed tourist guides directory

Official **Visit Cyprus** licensed guide list (Aug 2026 PDF) as a read-only browse surface. Verified in-app booking partners remain on `/book/guide`.

## Commands

```bash
# Requires poppler-utils (pdftotext)
npm run guides:parse-pdf

# Regenerates src/data/guides-directory.ts from PDF
```

PDF source: [TOURIST_GUIDES_AUG.2026_EN.pdf](https://www.visitcyprus.com/wp-content/uploads/2026/08/TOURIST_GUIDES_AUG.2026_EN.pdf)

## App routes

| Route | Purpose |
|-------|---------|
| `/guides/directory` | Browse/filter licensed guides by district + language |
| `/book/guide` | Verified partners with in-app booking |

Trail detail **Book a guide** falls back to `/guides/directory?district=…` when no verified partner covers the trail.

## Tiers

1. **Verified partners** — `src/data/guides.ts`, `/book/guide`, partner portal
2. **Licensed directory** — PDF-sourced contacts; direct phone/email only (no in-app intro form yet)
