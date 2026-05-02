import DiscoverPage from "@/app/(padded)/discover/page";
import { discoverListPageMeta } from "@/lib/locale-page-meta";
import { applyLocaleToMetadata } from "@/lib/locale-seo";

export default DiscoverPage;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return applyLocaleToMetadata(discoverListPageMeta, "/discover", locale);
}
