import Page from "@/app/(padded)/secrets/page";
import { buildTranslatedHubMetadata } from "@/lib/translated-page-meta";

export default Page;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildTranslatedHubMetadata("secrets", locale);
}
