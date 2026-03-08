# Right Now Near You — Debugging Guide

When "Use my location" or "Pick a region" doesn't work, use this guide to isolate the cause.

---

## Quick Checks

### 1. Open DevTools Console (F12 → Console)

Run the app (`npm run dev`) and click "Use my location" or "Pick a region". Look for:

- `[RightNow] geolocation error: 1 ...` → Permission denied. User must allow location or pick a region.
- `[RightNow] geolocation error: 2 ...` → Position unavailable (insecure context, GPS off, etc.). App falls back to Larnaca.
- `[RightNow] geolocation error: 3 ...` → Timeout. App falls back to Larnaca.
- `[RightNow] navigator.geolocation unavailable` → Browser has no geolocation API. App uses Larnaca.
- `[RightNow] fetch error: ...` → API request failed (network, CORS, 500, etc.).

### 2. Test the API Directly

```bash
curl -s "http://localhost:3000/api/right-now?lat=34.92&lng=33.63&limit=4&maxDistance=25" | jq '.items | length'
```

- Returns a number (0–4) → API works. Problem is client-side.
- 400/429/500 or connection error → API or network issue.

### 3. "Pick a region" vs "Use my location"

| Symptom | Likely cause |
|--------|---------------|
| Both buttons do nothing | JavaScript error, or component not hydrating. Check console for errors. |
| "Pick a region" works, "Use my location" fails | Geolocation permission denied, insecure context (HTTP), or geolocation disabled. |
| "Use my location" works, "Pick a region" fails | Unlikely; region picker only calls `setState`. Check for re-mounts. |
| Loading forever | API timeout or 500. Check Network tab for `/api/right-now`. |

---

## Common Causes

### Geolocation only works in secure contexts

- Works: `https://` and `http://localhost`
- Does **not** work: `http://192.168.x.x`, `http://*.ngrok.io` (non-HTTPS)

**Workaround:** Use "Pick a region" or deploy with HTTPS.

### Permission denied (err.code === 1)

- User clicked "Block" in the browser prompt.
- Site previously denied; some browsers remember this.

**Workaround:** Use "Pick a region", or clear site data / use a different browser.

### Onboarding modal blocks the section

- First visit: Onboarding modal covers the page.
- User must "Skip tour" or "Explore now" to see Right Now.

**Workaround:** Dismiss onboarding before testing Right Now.

### API returns 500

- Weather (Open-Meteo) fetch fails or times out.
- Server error in `scoreAndRank`, `getPlaceCoords`, etc.

**Check:** Server logs; Network tab response for `/api/right-now`.

### Locale / base path

- Fetch uses `window.location.origin`, so `/api/right-now` should resolve correctly on `/en`, `/de`, etc.
- If the app uses a custom `basePath`, verify API routes are reachable.

---

## Manual Test Flow

1. `npm run dev` → open `http://localhost:3000`
2. Dismiss onboarding if shown.
3. Scroll to "Right now near you".
4. Click **"Pick a region"** → region chips should appear.
5. Click a region (e.g. Troodos) → loading skeletons → loaded or empty state.
6. If that works, click **"Use my location"** → allow/deny prompt → loading → result.

---

## Coordinate coverage

Distance calculations use `getPlaceCoords` (`src/lib/place-coords.ts`):

| Place type | Source | Count |
|------------|--------|-------|
| Trails | `trailheadCoords` | 63 |
| Wineries | `latitude`/`longitude` | 63 |
| Restaurants | `latitude`/`longitude` | 34 |
| Attractions | `latitude`/`longitude` | 62 |
| Events | `latitude`/`longitude` | 11 |

When a place lacks explicit coords, `getRegionCentroid(place.region)` is used. Region centroids: `src/data/region-centroids.ts`.

---

## Files

| File | Role |
|------|------|
| `src/hooks/useRightNowFeed.ts` | State, geolocation, API fetch |
| `src/app/_home/RightNowNearYou.tsx` | UI and view switching |
| `src/components/LocationActionButtons.tsx` | Use my location / Pick a region buttons |
| `src/components/RegionPickerChips.tsx` | Region chips + "Use my location instead" |
| `src/app/api/right-now/route.ts` | API: weather + scoring + items |
| `src/lib/right-now-scoring.ts` | Scoring, diversification (max 1 per type in top 4) |
| `src/lib/place-coords.ts` | Coords: trails (trailhead), wineries, restaurants, attractions, events (lat/lng or region centroid) |
| `src/data/region-centroids.ts` | Region centroids for distance calculation |
