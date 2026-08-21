# Place Enrichment Pipeline

Crawls websites and Google for your places (attractions, wineries, restaurants, trails, events), extracts facts, and outputs suggestions for updating `src/data/`.

## Setup

### 1. Google Custom Search

1. Create a [Custom Search Engine](https://programmablesearchengine.google.com/)
   - Add any site to start (e.g. `cyprus.com`), or use "Search the entire web"
2. Enable the [Custom Search JSON API](https://console.cloud.google.com/apis/library/customsearch.googleapis.com)
3. Create an API key in Google Cloud Console
4. Add to `.env.local`:
   ```
   GOOGLE_API_KEY=your_key
   GOOGLE_CSE_ID=your_search_engine_id
   ```

### 2. OpenAI (optional)

For AI fact extraction (opening hours, phone, descriptions):

```
OPENAI_API_KEY=sk-...
```

Without this, the pipeline still runs and uses regex extraction for phones and hours.

## Usage

```bash
# 1. Export places from src/data to places.json
npm run data:export

# 2. Run enrichment (processes 5 places by default)
npm run data:enrich

# Process more (e.g. 20)
ENRICH_LIMIT=20 npm run data:enrich
```

## Output

- `places.json` — exported places (from step 1)
- `suggestions-YYYY-MM-DD.json` — discovered URLs, crawled snippets, and suggested updates

Review suggestions before applying. Suggested fields include `openingHours`, `contactPhone`, `description`, `highlights`. Apply changes manually to `src/data/attractions.ts`, `restaurants.ts`, `wineries.ts`, etc.

**Keep in sync:** After editing `src/data/`, run `npm run data:export` so `places.json` matches the live catalog. `npm run data:validate` fails if the file drifts (Forestry trail stats, opening hours, etc.).

## Rate limits

- ~1.5s delay between Google and crawl requests
- Google Custom Search: 100 queries/day free, then $5/1000
- Respect `robots.txt` and target site terms of service
