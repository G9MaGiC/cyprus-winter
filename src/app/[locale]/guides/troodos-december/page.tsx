import Page from "@/app/(padded)/guides/troodos-december/page";
import { troodosGuidePageMeta } from "@/lib/locale-page-meta";
import { applyLocaleToMetadata } from "@/lib/locale-seo";

export default Page;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return applyLocaleToMetadata(troodosGuidePageMeta, "/guides/troodos-december", locale);
}
