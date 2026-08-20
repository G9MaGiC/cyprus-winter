import { buildPwaManifest } from "@/lib/pwa-manifest";
import { routing } from "@/i18n/routing";

export const dynamic = "force-static";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ locale: string }> }
) {
  const { locale } = await context.params;
  const manifest = await buildPwaManifest(locale);
  if (!manifest) {
    return new Response("Not Found", { status: 404 });
  }
  return Response.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
