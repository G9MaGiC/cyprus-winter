import Page from "@/app/(padded)/wine-routes/page";
import { wineRoutesHubPageMeta } from "@/lib/locale-page-meta";
import { applyLocaleToMetadata } from "@/lib/locale-seo";

export default Page;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return applyLocaleToMetadata(wineRoutesHubPageMeta, "/wine-routes", locale);
}
