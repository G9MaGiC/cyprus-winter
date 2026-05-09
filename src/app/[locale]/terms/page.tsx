import Page from "@/app/(padded)/terms/page";
import { termsPageMeta } from "@/lib/locale-page-meta";
import { applyLocaleToMetadata } from "@/lib/locale-seo";

export default Page;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return applyLocaleToMetadata(termsPageMeta, "/terms", locale);
}
