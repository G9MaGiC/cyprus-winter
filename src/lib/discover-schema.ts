import type { DiscoverItem } from "@/data/discover";
import { truncateForSchema } from "@/lib/schema-text";

export type DiscoverSchemaBreadcrumb = {
  name: string;
  url: string;
};

export type DiscoverPageSchemaInput = {
  items: DiscoverItem[];
  siteUrl: string;
  pageUrl: string;
  name: string;
  description: string;
  breadcrumbs: DiscoverSchemaBreadcrumb[];
};

export function buildDiscoverItemListSchema(
  items: DiscoverItem[],
  siteUrl: string,
  pageUrl: string,
  name: string,
  description: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    url: pageUrl,
    numberOfItems: items.length,
    itemListElement: items.slice(0, 50).map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "TouristAttraction",
        name: item.name,
        description: truncateForSchema(item.description),
        url: `${siteUrl}/discover/${item.id}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: item.region,
          addressCountry: "CY",
        },
      },
    })),
  };
}

export function buildDiscoverBreadcrumbSchema(
  breadcrumbs: DiscoverSchemaBreadcrumb[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

export function buildDiscoverWebPageSchema(input: {
  pageUrl: string;
  name: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.name,
    description: input.description,
    url: input.pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "Cyprus Winter",
    },
  };
}

/** @graph bundle for discover list — ItemList + BreadcrumbList + WebPage */
export function buildDiscoverPageSchema(input: DiscoverPageSchemaInput) {
  const itemList = buildDiscoverItemListSchema(
    input.items,
    input.siteUrl,
    input.pageUrl,
    input.name,
    input.description
  );
  const breadcrumb = buildDiscoverBreadcrumbSchema(input.breadcrumbs);
  const webPage = buildDiscoverWebPageSchema({
    pageUrl: input.pageUrl,
    name: input.name,
    description: input.description,
  });

  return {
    "@context": "https://schema.org",
    "@graph": [webPage, breadcrumb, itemList],
  };
}
