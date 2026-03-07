/**
 * Enrichment pipeline: Google Search → crawl websites → extract facts → suggest updates.
 * Run: npx tsx scripts/enrich-places/enrich.ts
 *
 * Requires:
 * - GOOGLE_API_KEY + GOOGLE_CSE_ID (Custom Search)
 * - OPENAI_API_KEY (optional, for AI fact extraction)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type PlaceExport = {
  id: string;
  name: string;
  region: string;
  type: string;
  urls: string[];
  current?: {
    openingHours?: string;
    contactPhone?: string;
    description?: string;
    highlights?: string[];
  };
};

type EnrichedFact = {
  field: string;
  current?: string | string[];
  suggested: string | string[];
  source: string;
  confidence: "high" | "medium" | "low";
};

type PlaceSuggestion = {
  place: PlaceExport;
  discoveredUrls: string[];
  crawledSnippets: { url: string; snippet: string }[];
  suggestedUpdates: EnrichedFact[];
  errors: string[];
};

const DELAY_MS = 1500; // Be polite to Google and target sites
const USER_AGENT = "CyprusWinter/1.0 (content enrichment; +https://cypruswinter.com)";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function googleSearch(query: string, apiKey: string, cseId: string): Promise<string[]> {
  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("cx", cseId);
  url.searchParams.set("q", query);
  url.searchParams.set("num", "5");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Google Search failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { items?: { link: string }[] };
  return (json.items ?? []).map((i) => i.link);
}

async function fetchPageText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    redirect: "follow",
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return "";
  const html = await res.text();
  // Strip tags, collapse whitespace
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 15000); // Limit size for LLM
}

function extractFactsSimple(snippets: string[], place: PlaceExport): EnrichedFact[] {
  const text = snippets.join(" ");
  const facts: EnrichedFact[] = [];
  // Cyprus phone: +357 22 123456 or 357 99 123456
  const phoneMatch = text.match(/\+?357\s*\d{2}\s*\d{6,7}|tel[:\s]*([\d\s\-\+\(\)]{10,})/i);
  if (phoneMatch && !place.current?.contactPhone) {
    const phone = (phoneMatch[1] ?? phoneMatch[0]).replace(/\s+/g, " ").trim();
    if (phone.length >= 10)
      facts.push({ field: "contactPhone", suggested: phone, source: "regex", confidence: "medium" });
  }
  // Opening hours: 9am–5pm, 10:00-18:00, Mon-Fri 9-5
  const hoursMatch = text.match(
    /\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)?\s*[-–—to]+\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b|\b(Mon(?:day)?[-–]\s*Fri(?:day)?[^.]{0,50})\b/i
  );
  if (hoursMatch && !place.current?.openingHours) {
    const hrs = (hoursMatch[1] ?? hoursMatch[2] ?? "").trim();
    if (hrs.length > 3)
      facts.push({ field: "openingHours", suggested: hrs, source: "regex", confidence: "low" });
  }
  return facts;
}

async function extractFactsWithOpenAI(
  place: PlaceExport,
  snippets: string[],
  apiKey: string
): Promise<EnrichedFact[]> {
  const combined = snippets.join("\n\n---\n\n").slice(0, 12000);
  const prompt = `You are extracting factual information about a place in Cyprus from web content.

Place: ${place.name} (${place.region})
Type: ${place.type}

Current data we have:
${JSON.stringify(place.current ?? {}, null, 2)}

Web content (from official sites, Google, etc):
${combined}

Extract only VERIFIED facts (opening hours, phone, address, description snippets) that appear in the web content.
Return a JSON array of suggested updates. Each object: { "field": "openingHours"|"contactPhone"|"description"|"highlights", "suggested": string or string[], "source": "url or snippet", "confidence": "high"|"medium"|"low" }.
Only include fields where the web content clearly supports the value. If nothing useful found, return [].

JSON array only, no markdown:`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content ?? "";
  try {
    const parsed = JSON.parse(content.replace(/^```[\w]*\n?|\n?```$/g, "").trim());
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function enrichPlace(
  place: PlaceExport,
  googleKey: string,
  cseId: string,
  openaiKey: string | undefined
): Promise<PlaceSuggestion> {
  const result: PlaceSuggestion = {
    place,
    discoveredUrls: [],
    crawledSnippets: [],
    suggestedUpdates: [],
    errors: [],
  };

  try {
    // 1. Google Search for more URLs if we have few
    const searchQuery = `${place.name} ${place.region} Cyprus`;
    const searchUrls = await googleSearch(searchQuery, googleKey, cseId);
    const allUrls = [...new Set([...place.urls, ...searchUrls])].slice(0, 5);
    result.discoveredUrls = allUrls;

    // 2. Crawl each URL
    for (const url of allUrls) {
      await sleep(DELAY_MS);
      try {
        const text = await fetchPageText(url);
        if (text.length > 200) {
          result.crawledSnippets.push({ url, snippet: text.slice(0, 3000) });
        }
      } catch (e) {
        result.errors.push(`Crawl ${url}: ${(e as Error).message}`);
      }
    }

    // 3. Fact extraction
    if (result.crawledSnippets.length > 0) {
      const snippets = result.crawledSnippets.map((s) => s.snippet);
      if (openaiKey) {
        await sleep(DELAY_MS);
        try {
          const facts = await extractFactsWithOpenAI(place, snippets, openaiKey);
          result.suggestedUpdates = facts.map((f) => {
            const current =
              f.field === "highlights"
                ? place.current?.highlights
                : place.current?.[f.field as "openingHours" | "contactPhone" | "description"];
            return { ...f, current };
          });
        } catch (e) {
          result.errors.push(`OpenAI: ${(e as Error).message}`);
          result.suggestedUpdates = extractFactsSimple(snippets, place);
        }
      } else {
        result.suggestedUpdates = extractFactsSimple(snippets, place);
      }
    }
  } catch (e) {
    result.errors.push((e as Error).message);
  }

  return result;
}

async function main() {
  const googleKey = process.env.GOOGLE_API_KEY;
  const cseId = process.env.GOOGLE_CSE_ID;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!googleKey || !cseId) {
    console.error("Missing GOOGLE_API_KEY or GOOGLE_CSE_ID. See scripts/enrich-places/README.md");
    process.exit(1);
  }

  const placesPath = join(process.cwd(), "scripts", "enrich-places", "places.json");
  let places: PlaceExport[];
  try {
    places = JSON.parse(readFileSync(placesPath, "utf-8"));
  } catch {
    console.error("Run export first: npx tsx scripts/enrich-places/export-places.ts");
    process.exit(1);
  }

  const limit = parseInt(process.env.ENRICH_LIMIT ?? "5", 10);
  const toProcess = places.slice(0, limit);
  console.log(`Processing ${toProcess.length} places (set ENRICH_LIMIT for more)...`);
  if (!openaiKey) console.log("OPENAI_API_KEY not set; skipping AI fact extraction.");

  const results: PlaceSuggestion[] = [];
  for (let i = 0; i < toProcess.length; i++) {
    const p = toProcess[i];
    console.log(`[${i + 1}/${toProcess.length}] ${p.name}...`);
    const r = await enrichPlace(p, googleKey, cseId, openaiKey);
    results.push(r);
    await sleep(DELAY_MS);
  }

  const outPath = join(
    process.cwd(),
    "scripts",
    "enrich-places",
    `suggestions-${new Date().toISOString().slice(0, 10)}.json`
  );
  writeFileSync(outPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`Wrote ${results.length} suggestions to ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
