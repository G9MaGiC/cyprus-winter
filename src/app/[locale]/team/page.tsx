import TeamPage from "@/app/(padded)/team/page";
import { teamPageMeta } from "@/lib/locale-page-meta";
import { applyLocaleToMetadata } from "@/lib/locale-seo";

export default TeamPage;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return applyLocaleToMetadata(teamPageMeta, "/team", locale);
}
