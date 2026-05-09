import Page from "@/app/(padded)/wineries/page";
import { wineriesPageMeta } from "@/lib/locale-page-meta";
import { applyLocaleToMetadata } from "@/lib/locale-seo";

export default Page;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return applyLocaleToMetadata(wineriesPageMeta, "/wineries", locale);
}
