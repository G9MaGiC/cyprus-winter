import type { MetadataRoute } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { TOKENS } from "@/lib/design-tokens";
import { localizedPathname } from "@/lib/seo-locale-urls";

export type PwaManifest = MetadataRoute.Manifest & {
  lang?: string;
  dir?: "ltr" | "rtl";
};

function isAppLocale(locale: string): locale is Locale {
  return (routing.locales as readonly string[]).includes(locale);
}

function nestedString(messages: unknown, path: string): string {
  const parts = path.split(".");
  let cur: unknown = messages;
  for (const part of parts) {
    if (!cur || typeof cur !== "object") {
      throw new Error(`Missing message path: ${path}`);
    }
    cur = (cur as Record<string, unknown>)[part];
  }
  if (typeof cur !== "string") {
    throw new Error(`Message path is not a string: ${path}`);
  }
  return cur;
}

async function loadMessages(locale: Locale): Promise<unknown> {
  return (await import(`../../messages/${locale}.json`)).default;
}

/**
 * Build a Web App Manifest for the given locale (as-needed URL prefixes).
 */
export async function buildPwaManifest(locale: string): Promise<PwaManifest | null> {
  if (!isAppLocale(locale)) return null;

  const messages = await loadMessages(locale);
  const homePath = localizedPathname("/", locale);
  const planPath = localizedPathname("/plan", locale);
  const rightNowUrl = `${homePath}#right-now`;
  const rightNowLabel = nestedString(messages, "home.rightNowNearYou");
  const planLabel = nestedString(messages, "nav.plan");

  return {
    name: nestedString(messages, "manifest.name"),
    short_name: nestedString(messages, "home.title"),
    description: nestedString(messages, "manifest.description"),
    start_url: homePath,
    scope: homePath,
    display: "standalone",
    lang: locale,
    dir: locale === "he" ? "rtl" : "ltr",
    background_color: TOKENS.sand,
    theme_color: TOKENS.terracotta,
    orientation: "portrait-primary",
    shortcuts: [
      {
        name: rightNowLabel,
        short_name: rightNowLabel,
        description: nestedString(messages, "manifest.shortcuts.rightNowDescription"),
        url: rightNowUrl,
      },
      {
        name: planLabel,
        short_name: planLabel,
        description: nestedString(messages, "plan.aria.yourItinerary"),
        url: planPath,
      },
    ],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

export function pwaManifestHref(locale: string): string {
  const safe = isAppLocale(locale) ? locale : routing.defaultLocale;
  return `/manifests/${safe}`;
}
