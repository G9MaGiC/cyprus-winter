import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = SITE_URL;
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
