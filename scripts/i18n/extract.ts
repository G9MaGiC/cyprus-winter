/**
 * i18n extraction script.
 * Extracts user-facing strings from data files, lib configs, TSX components, and manifest.
 * Output: scripts/i18n/strings.json (flat key-value for translation)
 * Run: npm run i18n:extract (uses tsx)
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const importPath = (p: string) => pathToFileURL(p).href;
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const OUTPUT_PATH = path.join(PROJECT_ROOT, "scripts/i18n/strings.json");
const SRC = path.join(PROJECT_ROOT, "src");

// Run from project root so TS imports resolve
process.chdir(PROJECT_ROOT);

/** Add string to output, dedupe by value */
function add(out: Record<string, string>, key: string, value: string): void {
  const v = value.trim();
  if (v.length < 2 || /^[\d\s\-\.]+$/.test(v)) return;
  out[key] = v;
}

/** Extract from data files via dynamic import (requires tsx) */
async function extractData(out: Record<string, string>): Promise<void> {
  const ATTR_FIELDS = [
    "name",
    "description",
    "region",
    "highlights",
    "bestFor",
    "backstory",
    "winterTip",
    "bestTimeToVisit",
    "localSecret",
    "culturalNote",
    "openingHours",
    "transport",
    "parking",
    "accessibility",
  ];

  const TRAIL_EXTRA = ["winterNotes", "trailhead", "bring", "winterSafety"];
  const TRAIL_FIELDS = [...ATTR_FIELDS.filter((f) => f !== "backstory"), ...TRAIL_EXTRA];

  const extractItem = (
    item: Record<string, unknown>,
    base: string,
    fields: string[]
  ) => {
    const id = String(item.id || item.slug || "item");
    for (const f of fields) {
      const v = item[f];
      if (v == null) continue;
      if (Array.isArray(v)) {
        v.forEach((s, i) => {
          if (typeof s === "string" && s.trim()) add(out, `${base}.${id}.${f}.${i}`, s);
        });
      } else if (typeof v === "string") {
        add(out, `${base}.${id}.${f}`, v);
      }
    }
    const wp = item.waypoints as Array<{ name?: string; note?: string }> | undefined;
    if (wp) {
      wp.forEach((w, i) => {
        if (w?.name) add(out, `${base}.${id}.waypoints.${i}.name`, w.name);
        if (w?.note) add(out, `${base}.${id}.waypoints.${i}.note`, w.note);
      });
    }
  };

  try {
    const { beaches, ancientSites, villages, monasteries } = await import(
      importPath(path.join(SRC, "data/attractions.ts"))
    );
    const { wineries } = await import(importPath(path.join(SRC, "data/wineries.ts")));
    const { restaurants } = await import(importPath(path.join(SRC, "data/restaurants.ts")));
    const { trails } = await import(importPath(path.join(SRC, "data/trails.ts")));
    const { winterEvents } = await import(importPath(path.join(SRC, "data/events.ts")));
    const { airports } = await import(importPath(path.join(SRC, "data/airport.ts")));
    const { homeEditorsPicks, homeFeaturedWineries } = await import(
      importPath(path.join(SRC, "data/home.ts"))
    );
    const {
      winterTipsGeneral,
      winterTipsHiking,
      winterTipsPractical,
    } = await import(importPath(path.join(SRC, "data/winter-tips.ts")));
    const { team } = await import(importPath(path.join(SRC, "data/team.ts")));
    const { BADGES } = await import(importPath(path.join(SRC, "data/badges.ts")));
    const { secretGems } = await import(importPath(path.join(SRC, "data/secret-gems.ts")));
    const { REGION_CONFIGS } = await import(importPath(path.join(SRC, "data/regions.ts")));
    const { WINE_ROUTES } = await import(importPath(path.join(SRC, "data/wine-routes.ts")));
    const { weatherByMonth } = await import(importPath(path.join(SRC, "data/weather.ts")));

    const allAttrs = [...beaches, ...ancientSites, ...villages, ...monasteries];
    for (const a of allAttrs) extractItem(a as Record<string, unknown>, "data.attractions", ATTR_FIELDS);
    for (const w of wineries) extractItem(w as Record<string, unknown>, "data.wineries", ATTR_FIELDS);
    for (const r of restaurants) extractItem(r as Record<string, unknown>, "data.restaurants", ATTR_FIELDS);
    for (const t of trails) extractItem(t as Record<string, unknown>, "data.trails", TRAIL_FIELDS);
    for (const e of winterEvents) extractItem(e as Record<string, unknown>, "data.events", ATTR_FIELDS);

    for (const a of airports) {
      const base = `data.airport.${a.code}`;
      add(out, `${base}.name`, a.name);
      add(out, `${base}.city`, a.city);
      (a.tips || []).forEach((tip: string, i: number) => add(out, `${base}.tips.${i}`, tip));
      (a.transport || []).forEach((trans: { type?: string; description?: string; approxCost?: string; duration?: string; tip?: string }, i: number) => {
        if (trans.type) add(out, `${base}.transport.${i}.type`, trans.type);
        if (trans.description) add(out, `${base}.transport.${i}.description`, trans.description);
        if (trans.approxCost) add(out, `${base}.transport.${i}.approxCost`, trans.approxCost);
        if (trans.duration) add(out, `${base}.transport.${i}.duration`, trans.duration);
        if (trans.tip) add(out, `${base}.transport.${i}.tip`, trans.tip);
      });
    }

    for (const h of homeEditorsPicks) {
      add(out, `data.home.editorsPicks.${h.id}.title`, h.title);
      add(out, `data.home.editorsPicks.${h.id}.desc`, h.desc);
      add(out, `data.home.editorsPicks.${h.id}.imageAlt`, h.imageAlt);
    }
    for (const h of homeFeaturedWineries) {
      add(out, `data.home.featuredWineries.${h.wineryId}.title`, h.title);
      add(out, `data.home.featuredWineries.${h.wineryId}.subtitle`, h.subtitle);
      add(out, `data.home.featuredWineries.${h.wineryId}.imageAlt`, h.imageAlt);
    }

    for (const tip of [...winterTipsGeneral, ...winterTipsHiking, ...winterTipsPractical]) {
      add(out, `data.winterTips.${tip.id}.title`, tip.title);
      add(out, `data.winterTips.${tip.id}.body`, tip.body);
    }

    for (const m of team) {
      add(out, `data.team.${m.id}.name`, m.name);
      add(out, `data.team.${m.id}.role`, m.role);
      add(out, `data.team.${m.id}.bio`, m.bio);
      (m.expertise || []).forEach((exp: string, i: number) => add(out, `data.team.${m.id}.expertise.${i}`, exp));
    }

    for (const [id, b] of Object.entries(BADGES)) {
      const badge = b as { name?: string; description?: string };
      add(out, `data.badges.${id}.name`, badge.name || "");
      add(out, `data.badges.${id}.description`, badge.description || "");
    }

    for (const g of secretGems) {
      add(out, `data.secretGems.${g.id}.title`, g.title);
      add(out, `data.secretGems.${g.id}.body`, g.body);
      add(out, `data.secretGems.${g.id}.region`, g.region);
    }

    for (const r of REGION_CONFIGS) {
      add(out, `data.regions.${r.slug}.title`, r.title);
      add(out, `data.regions.${r.slug}.description`, r.description);
    }

    for (const r of WINE_ROUTES) {
      add(out, `data.wineRoutes.${r.slug}.title`, r.title);
      add(out, `data.wineRoutes.${r.slug}.description`, r.description);
    }

    for (const w of weatherByMonth) {
      add(out, `data.weather.${w.month}.month`, w.month);
      add(out, `data.weather.${w.month}.coastDesc`, w.coastDesc);
      add(out, `data.weather.${w.month}.troodosDesc`, w.troodosDesc);
    }
  } catch (e) {
    console.error("Data extraction failed:", e);
    throw e;
  }
}

async function extractLib(out: Record<string, string>): Promise<void> {
  const { navPrimaryLinks, navMoreLinks, bottomPrimaryLinks, mobileMenuGroups } = await import(
    importPath(path.join(SRC, "lib/nav-links.ts"))
  );
  const { BEST_FOR_OPTIONS } = await import(importPath(path.join(SRC, "lib/best-for.ts")));
  const { JOURNEY_CONFIG } = await import(importPath(path.join(SRC, "lib/discovery-journeys.ts")));

  const addNav = (link: { href: string; label: string }) => {
    const k = link.href === "/" ? "home" : link.href.replace(/\//g, "_").replace(/^_/, "");
    add(out, `common.nav.${k}`, link.label);
  };
  navPrimaryLinks.forEach(addNav);
  navMoreLinks.forEach(addNav);
  bottomPrimaryLinks.forEach(addNav);
  for (const g of mobileMenuGroups) {
    add(out, `common.nav.group.${g.title.toLowerCase().replace(/\s+/g, "_")}`, g.title);
    g.links.forEach(addNav);
  }

  for (const opt of BEST_FOR_OPTIONS) {
    add(out, `common.bestFor.${opt.slug}`, opt.label);
  }

  for (const [key, config] of Object.entries(JOURNEY_CONFIG)) {
    const c = config as { label?: string; sub?: string };
    if (c.label) add(out, `common.journey.${key}.label`, c.label);
    if (c.sub) add(out, `common.journey.${key}.sub`, c.sub);
  }

  add(out, "common.brand", "Cyprus Winter");
  add(out, "common.nav.more", "More");
  add(out, "common.nav.askAI", "Ask AI");
  add(out, "common.nav.searchAria", "Search places and trails");
  add(out, "common.nav.askAIAria", "Ask AI for trails, wineries, and trip ideas");
  add(out, "common.nav.openMenu", "Open menu");
  add(out, "common.nav.closeMenu", "Close menu");
  add(out, "common.skipToContent", "Skip to main content");
  add(out, "common.footer.discover", "Discover");
  add(out, "common.footer.plan", "Plan");
  add(out, "common.footer.airport", "Arriving");
  add(out, "common.footer.weather", "Weather");
  add(out, "common.footer.bookings", "Bookings");
  add(out, "common.footer.tagline", "Whether you found us from a Google search or at the airport: trails, villages, heritage. Olive groves, kafenions, Commandaria. Emergency 112 · Tourist info 1460 · Ambulance 199.");
  add(out, "common.footer.tips", "Drive on the left. Pack layers. The island rewards the curious. Winter November to March. Questions? Tap Ask AI.");
  add(out, "ui.hero.kicker", "Winter in Cyprus");
  add(out, "ui.hero.headline", "Trails, villages, heritage");
  add(out, "ui.hero.intro", "Nature, heritage, and slow discovery. One trail, one village, one tasting.");
  add(out, "ui.hero.subtext", "Plan ahead or start exploring when you land.");
  add(out, "ui.hero.discoverAria", "Go to Discover");
  add(out, "ui.hero.itineraryAria", "View your itinerary");
  add(out, "ui.hero.airportAria", "Transport from airport, tips");
  add(out, "ui.hero.askGuide", "Ask your guide");
  add(out, "ui.hero.imageAlt", "Kourion ancient theatre, Mediterranean coast, Cyprus winter");
}

function extractTSX(out: Record<string, string>): void {
  const walk = (dir: string): string[] => {
    const files: string[] = [];
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          if (!e.name.startsWith(".") && e.name !== "node_modules") {
            files.push(...walk(full));
          }
        } else if (e.name.endsWith(".tsx") || e.name.endsWith(".ts")) {
          files.push(full);
        }
      }
    } catch {
      /* ignore */
    }
    return files;
  };

  const translatableAttrs = ["alt", "aria-label", "title", "placeholder"];
  const files = [...walk(path.join(SRC, "app")), ...walk(path.join(SRC, "components"))];
  let keyIndex = 0;

  for (const file of files) {
    const rel = path
      .relative(SRC, file)
      .replace(/\.(tsx|ts)$/, "")
      .replace(/[/\\]/g, "_")
      .replace(/\[locale\]_?/g, ""); // normalize: app__home_HomeHero
    const content = fs.readFileSync(file, "utf-8");

    for (const attr of translatableAttrs) {
      const re = new RegExp(`${attr}=["']([^"']{3,}?)["']`, "g");
      let m;
      while ((m = re.exec(content)) !== null) {
        const val = m[1].replace(/\\"/g, '"').trim();
        if (val.length > 2) {
          add(out, `ui.${rel}.${attr}_${keyIndex++}`, val);
        }
      }
      const re2 = new RegExp(`${attr}={\\s*["']([^"']{3,}?)["']\\s*}`, "g");
      while ((m = re2.exec(content)) !== null) {
        const val = m[1].replace(/\\"/g, '"').trim();
        if (val.length > 2) {
          add(out, `ui.${rel}.${attr}_${keyIndex++}`, val);
        }
      }
    }

    const textRe = />\s*([^<{][^<{]*?)\s*</g;
    let m;
    while ((m = textRe.exec(content)) !== null) {
      const val = m[1].trim();
      if (
        val.length >= 4 &&
        !/^\s*[\d\.\-\,]+\s*$/.test(val) &&
        !val.includes("→") &&
        !val.startsWith("{") &&
        !val.includes("className")
      ) {
        add(out, `ui.${rel}.text_${keyIndex++}`, val);
      }
    }
  }
}

/** HomeHero uses t() with keys that extractTSX does not capture. Add them explicitly. */
function extractHomeHero(out: Record<string, string>): void {
  const keys: Record<string, string> = {
    "ui.app__home_HomeHero.aria-label_10": "Go to Discover",
    "ui.app__home_HomeHero.aria-label_11": "View your itinerary",
    "ui.app__home_HomeHero.aria-label_12": "Transport from airport, tips",
    "ui.app__home_HomeHero.text_13": "Winter in Cyprus",
    "ui.app__home_HomeHero.text_14": "Trails, villages, heritage",
    "ui.app__home_HomeHero.text_16": "Often sixteen degrees when home is six. Plan ahead or start exploring when you land.",
  };
  for (const [k, v] of Object.entries(keys)) {
    add(out, k, v);
  }
}

function extractManifest(out: Record<string, string>): void {
  const p = path.join(PROJECT_ROOT, "public/manifest.json");
  if (!fs.existsSync(p)) return;
  const manifest = JSON.parse(fs.readFileSync(p, "utf-8"));
  if (manifest.name) add(out, "manifest.name", manifest.name);
  if (manifest.short_name) add(out, "manifest.short_name", manifest.short_name);
  if (manifest.description) add(out, "manifest.description", manifest.description);
}

async function main(): Promise<void> {
  const out: Record<string, string> = {};
  console.log("Extracting from data files...");
  await extractData(out);
  console.log("Extracting from lib...");
  await extractLib(out);
  console.log("Extracting from TSX...");
  extractTSX(out);
  console.log("Extracting from manifest...");
  extractManifest(out);
  console.log("Extracting HomeHero t() keys...");
  extractHomeHero(out);

  const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(sorted, null, 2), "utf-8");
  console.log(`Wrote ${Object.keys(sorted).length} strings to ${OUTPUT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
