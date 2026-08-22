/** Visit Cyprus official nature-trail catalog URLs (English). */
export const VC_TRAILS_INDEX_URL =
  "https://www.visitcyprus.com/discover-cyprus/nature/nature-trails-2/" as const;

export const VC_SITEMAP_INDEX_URL = "https://www.visitcyprus.com/sitemap_index.xml" as const;

/** Slugs that appear on the index but are hub pages, not individual trails. */
export const VC_TRAIL_INDEX_IGNORE_SLUGS = new Set(["feed", "page", "island-hiking"]);

export const VC_TRAIL_SLUG_PATH_PREFIX = "discover-cyprus/nature/nature-trails-2/" as const;
