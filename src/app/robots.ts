import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = SITE_URL;
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/partner/",
          "/api/",
          "/login",
          "/register",
          "/account",
          "/bookings",
          "/install",
          "/partner",
          "/reset-password",
          "/forgot-password",
          // Locale-prefixed auth/account (next-intl); * is a path wildcard per Google robots rules
          "/*/admin/",
          "/*/partner/",
          "/*/login",
          "/*/register",
          "/*/account",
          "/*/bookings",
          "/*/install",
          "/*/partner",
          "/*/reset-password",
          "/*/forgot-password",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
