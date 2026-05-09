import Page from "@/app/(padded)/villages/page";
import { villagesPageMeta } from "@/lib/locale-page-meta";
import { applyLocaleToMetadata } from "@/lib/locale-seo";

export default Page;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return applyLocaleToMetadata(villagesPageMeta, "/villages", locale);
}
