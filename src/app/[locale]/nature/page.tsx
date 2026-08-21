import Page from "@/app/(padded)/nature/page";
import { buildTranslatedHubMetadata } from "@/lib/translated-page-meta";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return buildTranslatedHubMetadata("nature", locale);
}

export default Page;
