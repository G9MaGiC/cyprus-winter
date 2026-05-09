import WineryBookPage from "@/app/(padded)/book/winery/[id]/page";
import { bookWineryMetadata } from "@/lib/locale-metadata-dynamic";

export { generateStaticParams } from "@/app/(padded)/book/winery/[id]/page";

export default WineryBookPage;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  return bookWineryMetadata(id, locale);
}
