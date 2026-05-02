import TrailPage from "@/app/(padded)/trails/[id]/page";
import { trailDetailMetadata } from "@/lib/locale-metadata-dynamic";

export default TrailPage;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  return trailDetailMetadata(id, locale);
}
