import Page from "@/app/(padded)/guides/troodos-december/page";
import { buildTranslatedHubMetadata } from "@/lib/translated-page-meta";

export default Page;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildTranslatedHubMetadata("guidesTroodosDecember", locale);
}
