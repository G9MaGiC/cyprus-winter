import Page from "@/app/(padded)/book/winery/page";
import { bookWineryIndexPageMeta } from "@/lib/locale-page-meta";
import { applyLocaleToMetadata } from "@/lib/locale-seo";

export default Page;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return applyLocaleToMetadata(bookWineryIndexPageMeta, "/book/winery", locale);
}
