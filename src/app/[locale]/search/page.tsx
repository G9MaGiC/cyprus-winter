import SearchPage from "@/app/(padded)/search/page";
import { searchPageMeta } from "@/lib/locale-page-meta";
import { applyLocaleToMetadata } from "@/lib/locale-seo";

export default SearchPage;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return applyLocaleToMetadata(searchPageMeta, "/search", locale);
}
